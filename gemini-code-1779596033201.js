((Scratch) => {
    'use strict';

    const icon = 'https://utakeuchigames.github.io/boolvariable/favicon.svg';

    class Boolvariable {
        constructor() {
            this.boolVariables = {};
            this.boolVariablesinfo = {};
            this.isUIOpen = false;
            this.isDelUIOpen = false; 

            // 🛑【自動清掃】ストップボタンが押された時にクローン用の一時変数を一斉清掃！
            if (Scratch.vm && Scratch.vm.runtime) {
                Scratch.vm.runtime.on('PROJECT_STOP_ALL', () => {
                    console.log("🛑 プロジェクト停止を検知！クローン用の一時変数をクリーンアップします。");
                    
                    for (const key of Object.keys(this.boolVariables)) {
                        if (key.includes('_clone_')) {
                            delete this.boolVariables[key];
                            delete this.boolVariablesinfo[key];
                        }
                    }
                    
                    this.refreshBlocks();
                });
            }
        }

        // セーブデータの書き出し
        customSave() {
            const saveData = {
                boolVariables: this.boolVariables,
                boolVariablesinfo: this.boolVariablesinfo
            };
            return JSON.stringify(saveData);
        }

        // セーブデータの読み込み
        customLoad(data) {
            if (!data) return;
            try {
                const parsed = (typeof data === 'string') ? JSON.parse(data) : data;
                if (parsed) {
                    this.boolVariables = parsed.boolVariables ?? {};
                    this.boolVariablesinfo = parsed.boolVariablesinfo ?? {};
                }
                this.refreshBlocks();
            } catch (e) {
                console.error("❌ データの復元に失敗したよ：", e);
            }
        }

        refreshBlocks() {
            setTimeout(() => {
                if (Scratch.vm && Scratch.vm.runtime) {
                    Scratch.vm.runtime.requestBlocksDisplayUpdate();
                }
            }, 50);
        }

        /**
         * 🏆 【スコープ厳密判定：修正版】
         * グローバル変数はクローンであっても絶対に隔離キー（_clone_）を作らず、共通のキーを返す。
         * ローカル変数（このスプライトのみ）の時だけ、クローン用に隔離する。
         */
        getUniqueKey(varName, util) {
            if (!util || !util.target) {
                return varName;
            }

            // すでに完成した内部キー（stage_あ や スプライト1_あ）の時はそのまま返す
            if (this.boolVariablesinfo[varName]) {
                return varName;
            }

            const spriteName = util.target.getName ? util.target.getName() : 'stage';
            const isClone = util.target.isOriginal === false;

            // 1. まず「このスプライトのみ（ローカル）」の定義があるか探す
            const localKey = `${spriteName}_${varName}`;
            if (Object.prototype.hasOwnProperty.call(this.boolVariablesinfo, localKey)) {
                // ローカル変数の場合：クローンなら隔離キー、本体ならローカルキーを返す
                return isClone ? `${localKey}_clone_${util.target.id}` : localKey;
            }

            // 2. なければ「すべてのスプライト用（グローバル）」
            // 💡【ここを大修正！】グローバル変数の場合は、クローンであっても一律で同じ共有キーを返す！
            return `stage_${varName}`;
        }

        /**
         * 🛡️ 【自動実体化 ＆ クローンローカル値引き継ぎ防壁】
         * 完全にUIで定義済みの変数をベースにして、不足している実体（ローカルのクローン用）を作る。
         */
        ensureVariableExists(varName, util) {
            if (varName === 'IGNORE_CLICK' || varName === 'OPEN_DELETE_UI' || varName === '(空)' || !varName) return varName;

            const internalKey = this.getUniqueKey(varName, util);

            // メモリ上にまだこの実体が存在しない（ローカル変数のクローンが初めてアクセスした時など）場合
            if (!Object.prototype.hasOwnProperty.call(this.boolVariables, internalKey)) {
                
                // 元となった親（本体）のキーを特定する
                let parentKey = internalKey;
                if (internalKey.includes('_clone_')) {
                    parentKey = internalKey.split('_clone_')[0];
                }

                // もし親の定義すら存在しない未作成の変数の場合は、安全のためグローバルとして1つだけ作る
                if (!Object.prototype.hasOwnProperty.call(this.boolVariables, parentKey)) {
                    const globalKey = `stage_${varName}`;
                    if (!Object.prototype.hasOwnProperty.call(this.boolVariables, globalKey)) {
                        this.boolVariables[globalKey] = false;
                        this.boolVariablesinfo[globalKey] = { name: varName, scope: 'stage' };
                    }
                    return globalKey;
                }

                // 親の値を完全に引き継ぐ
                const defaultValue = !!this.boolVariables[parentKey];

                // クローン用の実体をメモリに登録
                this.boolVariables[internalKey] = defaultValue;
                
                // info側にもクローン情報を登録
                const parentInfo = this.boolVariablesinfo[parentKey];
                const displayName = parentInfo ? (parentInfo.name ?? varName) : varName;
                const parentScope = parentInfo ? parentInfo.scope : 'stage';
                
                this.boolVariablesinfo[internalKey] = {
                    name: displayName,
                    scope: parentScope === 'stage' ? 'グローバル (クローン)' : `${parentScope} (クローン)`
                };
            }

            return internalKey;
        }

        getInfo() {
            return {
                id: 'BV', 
                name: 'Bool変数拡張',
                menuIconURI: icon,
                color1: "#ff8c1a",  
                color2: "#ff8000",          
                color3: "#db6d00",      
                blocks: [
                    { blockType: Scratch.BlockType.LABEL, text: '真偽値変数' },
                    { func: 'createUI', blockType: Scratch.BlockType.BUTTON, text: '変数作成フォームを開く' },
                    {
                        opcode: 'setBool',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'bool値[variable]を[bool]にする',
                        arguments: {
                            variable: { type: Scratch.ArgumentType.STRING, menu: 'boolVariableMenu' },
                            bool: { type: Scratch.ArgumentType.STRING, menu: 'staticBoolMenu' }
                        }
                    },
                    {
                        opcode: 'getBool',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'bool値[variable]',
                        arguments: {
                            variable: { type: Scratch.ArgumentType.STRING, menu: 'boolVariableMenu' }
                        }
                    },
                    {
                        opcode: 'ifBool',
                        blockType: Scratch.BlockType.EVENT,
                        text: 'bool値[variable]が[bool]になった時',
                        isEdgeActivated: false,
                        arguments: {
                            variable: { type: Scratch.ArgumentType.STRING, menu: 'boolVariableHatMenu' },
                            bool: { type: Scratch.ArgumentType.STRING, menu: 'staticBoolMenu' }
                        }
                    },
                    { opcode: 'getallBool', blockType: Scratch.BlockType.REPORTER, text: '全部のbool値を見る' },
                    { opcode: 'getallboolinfo', blockType: Scratch.BlockType.REPORTER, text: '全部のbool値の情報を見る' },
                    '---',
                    { blockType: Scratch.BlockType.LABEL, text: 'その他のキット' },
                    {
                        opcode: 'reversebool',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '![bool]',
                        arguments: { bool: { type: Scratch.ArgumentType.BOOLEAN } }
                    },
                    {
                        opcode: 'andbool',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[bool1] && [bool2]',
                        arguments: {
                            bool1: { type: Scratch.ArgumentType.BOOLEAN },
                            bool2: { type: Scratch.ArgumentType.BOOLEAN }
                        }
                    },
                    {
                        opcode: 'orbool',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[bool1] || [bool2]',
                        arguments: {
                            bool1: { type: Scratch.ArgumentType.BOOLEAN },
                            bool2: { type: Scratch.ArgumentType.BOOLEAN }
                        }
                    },
                    {
                        opcode: 'xorbool',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[bool1] !== [bool2]',
                        arguments: {
                            bool1: { type: Scratch.ArgumentType.BOOLEAN },
                            bool2: { type: Scratch.ArgumentType.BOOLEAN }
                        }
                    }
                ],
                menus: {
                    boolVariableMenu: { acceptReporters: false, items: 'getVariableMenuItems' },
                    boolVariableHatMenu: { acceptReporters: false, items: 'getVariableMenuItems' },
                    staticBoolMenu: { 
                        acceptReporters: false, 
                        items: [{text: 'true', value: 'true'}, {text: 'false', value: 'false'}] 
                    }
                }
            };
        }

        // 変数作成UIのレンダリング
        createUI() {
            if (this.isUIOpen) return;
            this.isUIOpen = true;

            const editingTarget = Scratch.vm.runtime.getEditingTarget();
            const isStage = editingTarget ? !!editingTarget.isStage : false;
            const currentTargetId = editingTarget ? (editingTarget.id ?? 'stage') : 'stage';
            const spriteName = editingTarget ? (editingTarget.getName ? editingTarget.getName() : currentTargetId) : 'stage';

            const overlay = document.createElement('div');
            overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background-color:var(--ui-modal-overlay,rgba(0,0,0,0.55));color:var(--ui-modal-foreground,#333333);display:flex;justify-content:center;align-items:center;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;`;

            const dialog = document.createElement('div');
            dialog.style.cssText = `background-color:var(--ui-modal-background,#ffffff);width:360px;outline:none;border:4px solid #ff8787;padding:0;border-radius:0.5rem;user-select:none;overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--shadow,0px 4px 15px rgba(0,0,0,0.3));`;

            dialog.innerHTML = `
                <div style="display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:space-between;align-items:center;height:3.125rem;width:100%;background-color:#ff4c4c;color:#ffffff;font-size:1rem;font-weight:normal;">
                    <div style="width:3.125rem;height:100%;"></div>
                    <div style="flex-grow:1;text-align:center;letter-spacing:0.4px;cursor:default;font-weight:bold;">新しい変数</div>
                    <div style="width:3.125rem;height:100%;display:flex;justify-content:center;align-items:center;z-index:1;">
                        <button id="ceoCloseXBtn" style="background:none;border:none;color:inherit;font-size:1.25rem;cursor:pointer;padding:0;width:100%;height:100%;">✕</button>
                    </div>
                </div>
                <div style="background:var(--ui-modal-background,#ffffff);padding:1.5rem 2.25rem;display:flex;flex-direction:column;">
                    <div style="font-weight:500;margin:0 0 0.75rem;font-size:14px;color:var(--text-primary,#575e75);text-align:left;">新しい変数名:</div>
                    <input type="text" id="varInput" style="margin-bottom:1.5rem;width:100%;border:1px solid var(--ui-black-transparent,rgba(0,0,0,0.15));border-radius:calc(0.5rem / 2);padding:0 1rem;height:3rem;color:var(--text-primary,#333333);background-color:var(--input-background,#ffffff);font-size:.875rem;outline:none;box-sizing:border-box;" autofocus />
                    <div style="display:flex;font-weight:normal;justify-content:space-between;margin-bottom:1.5rem;font-size:.875rem;color:var(--text-primary,#575e75);">
                        ${isStage ? `
                            <span style="font-size: 13px; color: var(--text-primary-alpha, #747474); line-height: 1.4; text-align: left;">ステージで作った変数は基本的にすべてのスプライトで使用できます</span>
                        ` : `
                            <label style="display:flex;align-items:center;cursor:pointer;">
                                <input type="radio" name="variableScopeOption" value="global" checked style="margin:3px 6px 3px 3px;width:16px;height:16px;" />
                                <span>すべてのスプライト用</span>
                            </label>
                            <label style="display:flex;align-items:center;cursor:pointer;">
                                <input type="radio" name="variableScopeOption" value="local" style="margin:3px 6px 3px 3px;width:16px;height:16px;" />
                                <span>このスプライトのみ</span>
                            </label>
                        `}
                    </div>
                    <div style="font-weight:bolder;text-align:right;margin-top:1rem;">
                        <button id="cancelBtn" style="padding:0.75rem 1rem;border-radius:0.25rem;background:var(--ui-white,#ffffff);color:var(--text-primary,#333333);border:1px solid var(--ui-black-transparent,rgba(0,0,0,0.15));font-weight:600;font-size:0.85rem;cursor:pointer;outline:none;">キャンセル</button>
                        <button id="okBtn" style="padding:0.75rem 1rem;border-radius:0.25rem;background:#ff4c4c;border:1px solid #ff4c4c;color:#ffffff;font-weight:600;font-size:0.85rem;cursor:pointer;outline:none;margin-left:0.5rem;">OK</button>
                    </div>
                </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            setTimeout(() => {
                const inputField = document.getElementById('varInput');
                if (inputField) inputField.focus();
            }, 50);

            const close = () => {
                overlay.remove(); 
                this.isUIOpen = false;
            };

            overlay.onclick = (e) => { if (e.target === overlay) close(); };
            document.getElementById('ceoCloseXBtn').onclick = close;
            document.getElementById('cancelBtn').onclick = close;

            document.getElementById('okBtn').onclick = () => {
                const name = document.getElementById('varInput').value;
                if (name && name.trim() !== "") {
                    const trimmedName = name.trim();
                    const scopeValue = (document.querySelector('input[name="variableScopeOption"]:checked') ?? { value: 'global' }).value;
                    
                    const isLocal = isStage ? false : (scopeValue === 'local');
                    const prefix = isLocal ? spriteName : 'stage';
                    
                    let isDuplicate = false;

                    for (const existingKey of Object.keys(this.boolVariables)) {
                        if (existingKey.includes('_clone_')) continue;
                        const info = this.boolVariablesinfo[existingKey];
                        const existingDisplayName = info ? (info.name ?? existingKey) : existingKey;

                        if (existingDisplayName === trimmedName) {
                            if (!isLocal) {
                                isDuplicate = true;
                                break;
                            } else {
                                if (!info || info.scope === 'stage' || info.scope === spriteName) {
                                    isDuplicate = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (isDuplicate) {
                        alert(`❌ エラー: 「${trimmedName}」という名前の変数はすでに存在するか、競合するため作成できません！`);
                        return;
                    }

                    const internalKey = `${prefix}_${trimmedName}`;
                    
                    this.boolVariables[internalKey] = false;
                    this.boolVariablesinfo[internalKey] = {
                        name: trimmedName,
                        scope: prefix
                    };
                    
                    this.refreshBlocks();
                }
                close();
            };

            document.getElementById('varInput').onkeypress = (e) => {
                if (e.key === 'Enter') document.getElementById('okBtn').click();
            };
        }

        // 変数メニュー（リスト）の生成
        getVariableMenuItems(currentlySelectedValue) {
            const menuItems = [];
            const currentTarget = Scratch.vm.runtime.getEditingTarget();
            const spriteName = currentTarget ? (currentTarget.getName ? currentTarget.getName() : (currentTarget.id ?? 'stage')) : 'stage';

            for (const key of Object.keys(this.boolVariables)) {
                if (key.includes('_clone_')) continue;

                const info = this.boolVariablesinfo[key];
                const dispName = info ? (info.name ?? key) : key;
                const scope = info ? info.scope : 'stage';
                
                if (scope === 'stage' || scope === spriteName) {
                    menuItems.push({ text: dispName, value: dispName });
                }
            }

            const isValidUserVar = Object.prototype.hasOwnProperty.call(this.boolVariables, `${spriteName}_${currentlySelectedValue}`) || Object.prototype.hasOwnProperty.call(this.boolVariables, `stage_${currentlySelectedValue}`);
            
            if (!isValidUserVar || !currentlySelectedValue || currentlySelectedValue === '(空)') {
                menuItems.unshift({ text: '(空)', value: '(空)' });
            } else {
                menuItems.push({ text: '(空)', value: '( Stock )' });
            }

            if (menuItems.length > 0) {
                menuItems.push({ text: '────────────────', value: 'IGNORE_CLICK' });
            }
            menuItems.push({ text: '🔥 変数を削除するフォームを開く', value: 'OPEN_DELETE_UI' });

            return menuItems;
        }

        // 変数削除UIのレンダリング
        createDeleteUI() {
            if (this.isDelUIOpen) return;
            this.isDelUIOpen = true;

            setTimeout(() => {
                const currentTarget = Scratch.vm.runtime.getEditingTarget();
                const spriteName = currentTarget ? (currentTarget.getName ? currentTarget.getName() : (currentTarget.id ?? 'stage')) : 'stage';

                const deleteableKeys = Object.keys(this.boolVariables).filter(internalKey => {
                    if (internalKey.includes('_clone_')) return false;
                    const info = this.boolVariablesinfo[internalKey];
                    if (!info) return true;
                    return info.scope === 'stage' || info.scope === spriteName;
                });

                if (deleteableKeys.length === 0) {
                    alert("❌ 削除できる変数がありません！");
                    this.isDelUIOpen = false; 
                    return;
                }

                const overlay = document.createElement('div');
                overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background-color:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;`;

                const dialog = document.createElement('div');
                dialog.style.cssText = `background-color:#ffffff;width:340px;border:4px solid #ff4c4c;border-radius:0.5rem;overflow:hidden;display:flex;flex-direction:column;box-shadow:0px 4px 15px rgba(0,0,0,0.3);`;

                let optionsHtml = '';
                for (const key of deleteableKeys) {
                    const info = this.boolVariablesinfo[key];
                    const disp = info ? (info.name ?? key) : key;
                    const typeText = info ? (info.scope === 'stage' ? '[グローバル]' : '[ローカル]') : '[不明]';
                    optionsHtml += `<option value="${key}">${typeText} ${disp}</option>`;
                }

                dialog.innerHTML = `
                    <div style="height:3rem;background-color:#ff4c4c;color:#ffffff;display:flex;justify-content:center;align-items:center;font-weight:bold;font-size:1rem;">
                        変数の削除
                    </div>
                    <div style="padding:1.5rem;display:flex;flex-direction:column;">
                        <div style="font-size:14px;color:#575e75;margin-bottom:0.75rem;text-align:left;">削除する変数を選択してください:</div>
                        <select id="deleteSelect" style="width:100%;height:2.5rem;border:1px solid #ccc;border-radius:4px;padding:0 0.5rem;font-size:14px;margin-bottom:1.5rem;background:#fff;outline:none;color:#000;">
                            ${optionsHtml}
                        </select>
                        <div style="text-align:right;">
                            <button id="cancelDelBtn" style="padding:0.5rem 1rem;border-radius:4px;background:#fff;color:#333;border:1px solid #ccc;font-weight:600;cursor:pointer;outline:none;">キャンセル</button>
                            <button id="executeDelBtn" style="padding:0.5rem 1rem;border-radius:4px;background:#ff4c4c;color:#fff;border:none;font-weight:600;cursor:pointer;outline:none;margin-left:0.5rem;">削除実行</button>
                        </div>
                    </div>
                `;

                overlay.appendChild(dialog);
                document.body.appendChild(overlay);

                const closeDel = () => {
                    overlay.remove();
                    this.isDelUIOpen = false; 
                };

                document.getElementById('cancelDelBtn').onclick = closeDel;
                overlay.onclick = (e) => { if (e.target === overlay) closeDel(); };

                document.getElementById('executeDelBtn').onclick = () => {
                    const targetKey = document.getElementById('deleteSelect').value;
                    const info = this.boolVariablesinfo[targetKey];
                    const dispName = info ? (info.name ?? targetKey) : targetKey;

                    if (confirm(`本当に bool値「${dispName}」を完全に削除しますか？\n(連動するクローン用の一時変数もすべて消去されます)`)) {
                        delete this.boolVariables[targetKey];
                        delete this.boolVariablesinfo[targetKey];

                        const basePrefix = targetKey.split('_')[0];
                        for (const key of Object.keys(this.boolVariables)) {
                            if (key.startsWith(`${basePrefix}_${dispName}_clone_`)) {
                                delete this.boolVariables[key];
                                delete this.boolVariablesinfo[key];
                            }
                        }

                        closeDel();
                        
                        setTimeout(() => {
                            alert(`🎉 bool値「${dispName}」を完全に削除しました！`);
                            if (Scratch.vm && Scratch.vm.runtime) {
                                Scratch.vm.runtime.requestBlocksDisplayUpdate();
                            }
                        }, 100);
                        return;
                    }
                    closeDel();
                };
            }, 100); 
        }

        // 値設定ブロック
        setBool(args, util) {
            if (args.variable === 'OPEN_DELETE_UI') {
                this.createDeleteUI();
                return;
            }
            if (args.variable === 'IGNORE_CLICK' || args.variable === '(空)') return;

            const actualKey = this.ensureVariableExists(args.variable, util);

            const prevalue = !!this.boolVariables[actualKey];
            this.boolVariables[actualKey] = (args.bool === 'true');

            if (prevalue !== (args.bool === 'true')) {
                const data = {
                    variable: args.variable, 
                    bool: args.bool,
                    actualKey: actualKey     
                };
                Scratch.vm.runtime.startHats("BV_ifBool", data, false);
            }
        }

        // 値取得ブロック
        getBool(args, util) {
            if (args.variable === 'OPEN_DELETE_UI') {
                this.createDeleteUI();
                return false;
            }
            if (args.variable === 'IGNORE_CLICK' || args.variable === '(空)') return false;

            const actualKey = this.ensureVariableExists(args.variable, util);
            return !!this.boolVariables[actualKey]; 
        }

        // ハットブロック（イベント条件判定）
        ifBool(args, util) {
            if (args.variable === 'IGNORE_CLICK' || args.variable === '(空)') return false;
            
            const myActualKey = this.getUniqueKey(args.variable, util);
            const targetData = util.currentBackgroundData;

            if (!targetData) return false;

            return myActualKey === targetData.actualKey && args.bool === targetData.bool;
        }

        getallBool(args) { return JSON.stringify(this.boolVariables); }
        getallboolinfo(args) { return JSON.stringify(this.boolVariablesinfo); }

        reversebool(args,util){ return !args.bool; }
        andbool(args,util){ return !!(args.bool1 && args.bool2); }
        orbool(args,util){ return !!(args.bool1 || args.bool2); }
        xorbool(args,util){ return (args.bool1 !== args.bool2); }
    }

    Scratch.extensions.register(new Boolvariable());

})(Scratch);