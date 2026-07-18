((Scratch) => {
    'use strict';
    const icon = 'https://utakeuchigames.github.io/boolvariable/favicon.svg';
    const vm = Scratch.vm;
    const {
       BlockType,
       ArgumentType,
       Cast
    } = Scratch;
    function xmlEscape(str) {
       return str.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
    }
    function validColour(colour) {
       if (typeof colour != "string") return false;
       const hexRegex = /^#[0-9A-F]{6}$/i;
       return hexRegex.test(colour);
    }
    const toastConfig = {
        soundWhenEnabled: "true"
    };
    const defaultStyles = {
       toast: {
          '--toast-bg': '#1a1a1a',
          '--toast-color': '#ffffff',
          '--toast-font-size': '16px',
          '--toast-border-radius': '16px',
          '--toast-padding': '15px',
          '--toast-duration': '3000',
          '--toast-min-width': '300px',
          '--toast-max-width': '400px',
          '--toast-shadow': '0 8px 16px rgba(0,0,0,0.2)',
          '--toast-z-index': 9999,
          '--toast-margin': '10px',
          'soundUrl': null
       },
       types: {
          origin: {
             '--toast-type-bg': '#1a1a1a',
             '--toast-type-color': '#ffffff'
          },
          success: {
             '--toast-type-bg': '#4CAF50',
             '--toast-type-color': '#ffffff'
          },
          error: {
             '--toast-type-bg': '#f44336',
             '--toast-type-color': '#ffffff'
          },
          warning: {
             '--toast-type-bg': '#ff9800',
             '--toast-type-color': '#000000'
          },
          info: {
             '--toast-type-bg': '#2196F3',
             '--toast-type-color': '#ffffff'
          }
       }
    };
    let styleConfig = JSON.parse(JSON.stringify(defaultStyles));
    const createToastContainer = (position) => {
       let container = document.getElementById('ToastContainer');
       if (!container) {
          container = document.createElement('div');
          container.id = 'ToastContainer';
          container.dataset.toasts = '0';
          document.body.appendChild(container);
       }
       container.className = `toast-container ${position}`;
       return container;
    };
    const injectStyles = () => {
        const styleId = 'ToastStyles';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `:root { --toast-slide-duration: 0.3s;} .toast-container { position: fixed; z-index: 9999; padding: 20px;} .toast-container.top-left { top: 0; left: 0; } .toast-container.top-right { top: 0; right: 0; } .toast-container.top-center { top: 0; left: 50%; transform: translateX(-50%); } .toast-container.bottom-left { bottom: 0; left: 0; } .toast-container.bottom-right { bottom: 0; right: 0; } .toast-container.bottom-center { bottom: 0; left: 50%; transform: translateX(-50%); } .toast-container.center-left { top: 50%; left: 0; transform: translateY(-50%); } .toast-container.center-right { top: 50%; right: 0; transform: translateY(-50%); } .toast-container.center-center { top: 50%; left: 50%; transform: translate(-50%, -50%);} .toast { display: flex; align-items: center; margin-bottom: var(--toast-margin); background-color: var(--toast-type-bg); color: var(--toast-type-color); font-size: var(--toast-font-size); border-radius: var(--toast-border-radius); padding: var(--toast-padding); min-width: var(--toast-min-width); max-width: var(--toast-max-width); box-shadow: var(--toast-shadow); opacity: 0; transform: translateY(100%); animation: toastSlideIn var(--toast-slide-duration) cubic-bezier(0.0, 0.0, 0.2, 1) forwards; } .toast img { width: 40px; height: 40px; margin-right: 15px; object-fit: cover; border-radius: calc(var(--toast-border-radius) / 2);} .toast-content { flex-grow: 1;} .toast-title { font-weight: bold; margin-bottom: 4px;} .toast-description { font-size: 0.9em; opacity: 0.8;} @keyframes toastSlideIn { from { opacity: 0; transform: translateY(100%);} to { opacity: 1; transform: translateY(0);}} @keyframes toastSlideOut { from { opacity: 1; transform: translateY(0);} to { opacity: 0; transform: translateY(100%);}}`;
        document.head.appendChild(style);};
        let deltaTime = 0;
        let previousTime = 0;
        let myScratchBlocks;
        if (Scratch.gui) {
            Scratch.gui.getBlockly().then(ScratchBlocks => {
                myScratchBlocks = ScratchBlocks; 
            });
        }
    class Boolvariable {
        static customId = 'boolvariable';
        constructor() {
            this.boolVariables = {};
            this.boolVariablesinfo = {};
            this.isUIOpen = false;
            this.isDelUIOpen = false; 
            this.frameCount = 0;
            this.customId = Boolvariable.customId;
            this.type = Boolvariable.customId;
            injectStyles();
        }
        refreshBlocks() {
            setTimeout(() => {
                if (Scratch.vm.extensionManager && typeof Scratch.vm.extensionManager.refreshBlocks === 'function') {
                    Scratch.vm.extensionManager.refreshBlocks();
                }
                if (Scratch.gui && typeof Scratch.gui.getWorkspace === 'function') {
                    const workspace = Scratch.gui.getWorkspace();
                    if (workspace) {
                        workspace.refreshToolboxSelection();
                    }
                }
                if (Scratch.vm && Scratch.vm.emit) {
                    Scratch.vm.emit('WORKSPACE_UPDATE_DATA');
                    Scratch.vm.emit('TOOLBOX_EXTENSIONS_NEED_UPDATE');
                }
            }, 5);
        }
        async _createToast(options) {
            const container = createToastContainer(options.position);
            const toast = document.createElement('div');
            toast.className = 'toast';
            const zIndex = styleConfig.toast['--toast-z-index'] || 9999;
            toast.style.zIndex = zIndex;
            const stackSize = parseInt(container.dataset.toasts || '0');
            container.dataset.toasts = stackSize + 1;
            const typeStyle = styleConfig.types[options.type] || styleConfig.types.origin;
            Object.entries(typeStyle).forEach(([prop, value]) => {
                toast.style.setProperty(prop, value);
            });
            Object.entries(styleConfig.toast).forEach(([prop, value]) => {
                if (prop !== 'soundUrl') {
                    toast.style.setProperty(prop, value);
                }
            });
            toast.style.transform = `translateY(${stackSize * 100}%)`;
            toast.style.transition = 'transform 0.3s ease-out';
            if (options.image && await fetch(options.image) {
                const img = document.createElement('img');
                img.src = options.image;
                img.alt = 'Toast icon'
                if (options.imageRounded) {
                    img.style.borderRadius = '50%';
                }
                toast.appendChild(img);
            }
            const content = document.createElement('div');
            content.className = 'toast-content';
            if (options.title) {
               const title = document.createElement('div');
               title.className = 'toast-title';
               title.textContent = options.title;
               content.appendChild(title);
            }
            const message = document.createElement('div');
            message.className = options.title ? 'toast-description' : 'toast-content';
            message.textContent = options.text;
            content.appendChild(message);
            toast.appendChild(content);
            container.appendChild(toast);
            if (toastConfig.soundWhenEnabled === "true" && styleConfig.toast.soundUrl) {
               const audio = new Audio(styleConfig.toast.soundUrl);
               audio.play().catch(() => {});
            }
            const duration = parseInt(styleConfig.toast['--toast-duration']) || defaultStyles.toast['--toast-duration'];
            setTimeout(() => {
                toast.style.animation = `toastSlideOut var(--toast-slide-duration) cubic-bezier(0.4, 0.0, 1, 1) forwards`;
                const toasts = container.querySelectorAll('.toast');
                toasts.forEach((t, i) => {
                    if (t !== toast) {
                       t.style.transform = `translateY(${i * 100}%)`;
                    }
                });
                setTimeout(() => {
                    toast.remove();
                    container.dataset.toasts = Math.max(0, stackSize - 1);
                }, 300);
            }, duration);
        }
        ensureVariableExists(internalKey) {
            if (Object.prototype.hasOwnProperty.call(this.boolVariables, internalKey)) {
                return;
            }
            console.log(`💡 未知のデータ「${internalKey}」を検知！自動復元を試みます。`);
            this._createToast({
                type: Cast.toString('origin'),
                image: xmlEscape(icon),
                title: xmlEscape(Cast.toString('変数を復元しました')),
                text: xmlEscape(Cast.toString(`変数: ${internalKey}を復元しました`)),
                position: Cast.toString('bottom-right')
            });
            let displayName = internalKey;
            let isLocal = false;
            let targetId = 'stage';
            if (internalKey.includes('_')) {
                const lastIndex = internalKey.lastIndexOf('_');
                isLocal = true; 
                targetId = internalKey.substring(0, lastIndex);
                displayName = internalKey.substring(lastIndex + 1);
            } else {
                displayName = internalKey;
                isLocal = false;
                targetId = 'stage';
            }
            this.boolVariables[internalKey] = false;
            this.boolVariablesinfo[internalKey] = {
                isLocal: isLocal,
                targetId: targetId,
                displayName: displayName
            };
            this.refreshBlocks();
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
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: '真偽値変数'
                    },
                    {
                        opcode: 'createUI',
                        blockType: Scratch.BlockType.BUTTON,
                        text: '変数作成フォームを開く'
                    },
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
                        isEdgeActivated: false, // startHats連動のイベント型
                        arguments: {
                            variable: { type: Scratch.ArgumentType.STRING, menu: 'boolVariableHatMenu' },
                            bool: { type: Scratch.ArgumentType.STRING, menu: 'staticBoolMenu' }
                        }
                    },
                    {
                        opcode: 'getallBool',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '全部のbool値を見る',
                    },
                    {
                        opcode: 'getallboolinfo',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '全部のbool値の情報を見る',
                    },
                    '---',
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: 'その他のキット'
                    },
                    {
                        opcode: 'reversebool',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '![bool]',
                        arguments: {
                            bool: { type: Scratch.ArgumentType.BOOLEAN }
                        }
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
                    },
                    {
                        opcode: 'waitFrames',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '[frames] フレーム待つ',
                        arguments: {
                            frames: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
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
        createUI(){
            try {
                const self = this;
                myScratchBlocks.prompt(
                    "新しい変数名:", "", 
                    (name, more_vars, {scope}) => {
                        if (!name || name.trim() === "") {
                            return;
                        }
                        const trimmedName = name.trim();
                        const editingTarget = Scratch.vm.runtime.getEditingTarget();
                        const currentTargetId = editingTarget ? (editingTarget.id ?? 'stage') : 'stage';
                        const isLocal = scope === "local";
                        const targetId = isLocal ? currentTargetId : 'stage';
                        const internalKey = isLocal ? `${targetId}_${trimmedName}` : trimmedName;
                        for (const key of Object.keys(self.boolVariablesinfo)) {
                            const info = self.boolVariablesinfo[key];
                            if (info.displayName === trimmedName) {
                                if (!isLocal && !info.isLocal) {
                                    alert(`「${trimmedName}」は既に存在します`);
                                    return;
                                }
                                if (isLocal && info.isLocal && info.targetId === targetId) {
                                    alert(`「${trimmedName}」は既に存在します`);
                                    return;
                                }
                            }
                        }
                        self.boolVariables[internalKey] = false;  // ← typo 修正
                        self.boolVariablesinfo[internalKey] = {
                            isLocal: isLocal,
                            targetId: targetId,
                            displayName: trimmedName
                        };
                        return;
                    },
                    "新しい変数",
                    Boolvariable.customId
                );
            }catch(err){
                
            }
        }
        getVariableMenuItems(currentlySelectedValue) {
            const menuItems = [];
            const currentTarget = Scratch.vm.runtime.getEditingTarget();
            const currentTargetId = currentTarget ? (currentTarget.id ?? 'stage') : 'stage';
            const variableKeys = Object.keys(this.boolVariables).filter(key => {
                const info = this.boolVariablesinfo[key];
                if (!info) return true;
                return !info.isLocal || info.targetId === currentTargetId;
            });
            if (variableKeys.length > 0) {
                for (const key of variableKeys) {
                    const info = this.boolVariablesinfo[key];
                    const dispName = info ? (info.displayName ?? key) : key;
                    menuItems.push({ text: dispName, value: key });
                }
                menuItems.push({ text: '変数を削除するフォームを開く', value: 'OPEN_DELETE_UI'});
            } else {
                menuItems.push({ text: '(空)', value: '(空)' });
            }
            return menuItems;
        }
        async createDeleteUI() {
            const currentTarget = Scratch.vm.runtime.getEditingTarget();
            const currentTargetId = currentTarget ? (currentTarget.id ?? 'stage') : 'stage';
            const deleteableKeys = Object.keys(this.boolVariables).filter(internalKey => {
                const info = this.boolVariablesinfo[internalKey];
                if (!info) return true;
                return !info.isLocal || info.targetId === currentTargetId;
            });
            if (deleteableKeys.length === 0) {
                alert("❌ このスプライトで削除できる変数がありません！");
                return;
            }
            const select = document.createElement("select");
            select.style.width = "100%";
            select.style.padding = "8px";
            select.style.marginBottom = "20px"
            deleteableKeys.forEach(key => {
                const info = this.boolVariablesinfo[key];
                const dispName = info?.displayName || key;
                const typeText = info ? (info.isLocal ? '[ローカル]' : '[グローバル]') : '[不明]';
                
                const option = document.createElement("option");
                option.value = key;
                option.textContent = `${typeText} ${dispName}`;
                select.appendChild(option);
            });
            const modal = await myScratchBlocks.customPrompt({
                title: "変数の削除",
                text: "削除する変数を選択してください:",
                onCancel: () => {
                    this.isDelUIOpen = false;
                }
            }, {
                content: { width: "300px" }
            }, [
            { 
                name: "削除", 
                role: "ok", 
                callback: () => {
                    const selectedKey = select.value;
                    if (!selectedKey) return;
                    
                    const dispname = select.options[select.selectedIndex].text;
                    
                    if (confirm(`本当に bool値「${dispname}」を完全に削除しますか？`)) {
                        delete this.boolVariables[selectedKey];
                        delete this.boolVariablesinfo[selectedKey];
                        alert(`🎉 bool値「${dispname}」を完全に削除しました！`);
                        this.refreshBlocks();
                    }
                    this.isDelUIOpen = false;
                } 
            },
            { 
                name: "キャンセル", 
                role: "close",
                callback: () => {
                    this.isDelUIOpen = false;
                }
            }
            ]);
            modal.appendChild(select);
        }
        setBool(args, util) { 
            if (args.variable === 'OPEN_DELETE_UI') {
                this.createDeleteUI();
                return;
            }
            if (args.variable === '(空)') return;
            this.ensureVariableExists(args.variable);
            const prevalue = this.boolVariables[args.variable];
            this.boolVariables[args.variable] = (args.bool === 'true');
            const data = {
                "variable": args.variable.toString(),
                bool: String(args.bool)
            };
            if (prevalue != (args.bool === 'true')) {
                Scratch.vm.runtime.startHats("BV_ifBool", data, false);
            }
        }
        getBool(args, util) {
            if (args.variable === 'OPEN_DELETE_UI') {
                this.createDeleteUI();
                return false;
            }
            if (args.variable === 'IGNORE_CLICK' || args.variable === '(空)') return false;
            this.ensureVariableExists(args.variable);
            return !!this.boolVariables[args.variable]; 
        }
        ifBool(args, util) {
            if (args.variable === 'IGNORE_CLICK' || args.variable === '(空)') return false;
            return args.variable === util.currentBackgroundData.variable && args.bool === util.currentBackgroundData.bool;
        }
        getallBool(args) { return JSON.stringify(this.boolVariables); }
        getallboolinfo(args) { return JSON.stringify(this.boolVariablesinfo); }
        reversebool(args,util){ return !args.bool; }
        andbool(args,util){ return !!(args.bool1 && args.bool2); }
        orbool(args,util){ return !!(args.bool1 || args.bool2); }
        xorbool(args,util){ return (args.bool1 !== args.bool2); }
        async waitFrames(args, util) {
            const targetFrame = this.frameCount + args.frames - 1;
            while (this.frameCount < targetFrame) {
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
        }
    }
    const Boolvariableextension = new Boolvariable();
    vm.runtime.on("BEFORE_EXECUTE", () => {
        Boolvariableextension.frameCount++;
        const now = performance.now();
        if (previousTime === 0) {
            deltaTime = 1 / vm.runtime.frameLoop.framerate;
        } else {
            deltaTime = (now - previousTime) / 1000;
        }
        previousTime = now;
    });
    Scratch.extensions.register(Boolvariableextension);
})(Scratch);
