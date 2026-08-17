(async (Scratch) => {
    "use strict";
    const icon = "https://utakeuchigames.github.io/boolvariable/favicon.svg";
    const vm = Scratch.vm;
    const { BlockType, ArgumentType, Cast } = Scratch;
    function xmlEscape(str) {
        return str
            .replace(/&/g, "&amp;")
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
    function createCustomModal({ title = '', text = '', extraHtml = '', customCss = '' } = {}) {
        if (customCss) {
            $('head').append(`<style>${customCss}</style>`);
        }
        const baseCss = `<style>
            .custom-modal{position:fixed;bottom:0;left:50%;transform:translateX(-50%) translateY(0);width:90%;max-width:500px;height:400px;border-top-left-radius:20px;border-top-right-radius:20px;background:#fff;box-shadow:0 -4px 20px rgba(0,0,0,0.15);display:flex;flex-direction:column;z-index:9999;box-sizing:border-box;transition:transform 0.3s cubic-bezier(0.25,1,0.5,1);touch-action:none;user-select:none;-webkit-user-select:none;}
            .custom-modal.dragging{transition:none;}
            .modal-handle-area{padding:12px 0;cursor:grab;touch-action:none;display:flex;justify-content:center;align-items:center;flex-shrink:0;}
            .modal-handle-bar{width:60px;height:6px;background:#d1d5db;border-radius:10px;pointer-events:none;}
            .modal-content{flex:1;overflow-y:auto;padding:10px 20px 20px;box-sizing:border-box;touch-action:pan-y;user-select:text;-webkit-user-select:text;}
        </style>`;
        if (!$('#custom-modal-base-style').length) {
            $('head').append(`<div id="custom-modal-base-style">${baseCss}</div>`);
        }
        const modalHtml = `
        <div class="custom-modal">
            <div class="modal-handle-area"><div class="modal-handle-bar"></div></div>
            <div class="modal-content">
                ${title ? `<p style="margin-top:0;font-weight:bold;font-size:18px;">${title}</p>` : ''}
                ${text ? `<p>${text}</p>` : ''}
                ${extraHtml}
            </div>
        </div>`;
        $('body').append(modalHtml);
        const $m = $('.custom-modal').last();
        const h = $m.outerHeight();
        let sy = 0, cy = 0, flag = false;
        $m.find('.modal-handle-area').on('touchstart mousedown', e => {
            flag = true;
            $m.addClass('dragging');
            sy = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            cy = 0;
        });
        $(window).on('touchmove.modal', e => {
            if (!flag) return;
            cy = Math.max(0, (e.type === 'touchmove' ? e.touches[0].clientY : e.clientY) - sy);
            $m.css('transform', `translateX(-50%) translateY(${cy}px)`);
        });
        $(window).on('touchend.modal mouseup.modal', () => {
            if (!flag) return;
            flag = false;
            $m.removeClass('dragging');
            if ((1 - cy / h) >= 0.7) {
                $m.css('transform', 'translateX(-50%) translateY(0px)');
            } else {
                $m.css('transform', `translateX(-50%) translateY(${h}px)`);
                setTimeout(() => $m.remove(), 300);
            }
        });
    }
    const toastConfig = {
        soundWhenEnabled: "true",
    };
    const defaultStyles = {
        toast: {
            "--toast-bg": "#1a1a1a",
            "--toast-color": "#ffffff",
            "--toast-font-size": "16px",
            "--toast-border-radius": "16px",
            "--toast-padding": "15px",
            "--toast-duration": "3000",
            "--toast-min-width": "300px",
            "--toast-max-width": "400px",
            "--toast-shadow": "0 8px 16px rgba(0,0,0,0.2)",
            "--toast-z-index": 9999,
            "--toast-margin": "10px",
            soundUrl: null,
        },
        types: {
            origin: {
                "--toast-type-bg": "#1a1a1a",
                "--toast-type-color": "#ffffff",
            },
            success: {
                "--toast-type-bg": "#4CAF50",
                "--toast-type-color": "#ffffff",
            },
            error: {
                "--toast-type-bg": "#f44336",
                "--toast-type-color": "#ffffff",
            },
            warning: {
                "--toast-type-bg": "#ff9800",
                "--toast-type-color": "#000000",
            },
            info: {
                "--toast-type-bg": "#2196F3",
                "--toast-type-color": "#ffffff",
            },
        },
    };
    let styleConfig = JSON.parse(JSON.stringify(defaultStyles));
    const createToastContainer = (position) => {
        let container = document.getElementById("ToastContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "ToastContainer";
            container.dataset.toasts = "0";
            document.body.appendChild(container);
        }
        container.className = `toast-container ${position}`;
        return container;
    };
    const injectStyles = () => {
        const styleId = "ToastStyles";
        if (document.getElementById(styleId)) return;
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `:root { --toast-slide-duration: 0.3s;} .toast-container { position: fixed; z-index: 9999; padding: 20px;} .toast-container.top-left { top: 0; left: 0; } .toast-container.top-right { top: 0; right: 0; } .toast-container.top-center { top: 0; left: 50%; transform: translateX(-50%); } .toast-container.bottom-left { bottom: 0; left: 0; } .toast-container.bottom-right { bottom: 0; right: 0; } .toast-container.bottom-center { bottom: 0; left: 50%; transform: translateX(-50%); } .toast-container.center-left { top: 50%; left: 0; transform: translateY(-50%); } .toast-container.center-right { top: 50%; right: 0; transform: translateY(-50%); } .toast-container.center-center { top: 50%; left: 50%; transform: translate(-50%, -50%);} .toast { display: flex; align-items: center; margin-bottom: var(--toast-margin); background-color: var(--toast-type-bg); color: var(--toast-type-color); font-size: var(--toast-font-size); border-radius: var(--toast-border-radius); padding: var(--toast-padding); min-width: var(--toast-min-width); max-width: var(--toast-max-width); box-shadow: var(--toast-shadow); opacity: 0; transform: translateY(100%); animation: toastSlideIn var(--toast-slide-duration) cubic-bezier(0.0, 0.0, 0.2, 1) forwards; } .toast img { width: 40px; height: 40px; margin-right: 15px; object-fit: cover; border-radius: calc(var(--toast-border-radius) / 2);} .toast-content { flex-grow: 1;} .toast-title { font-weight: bold; margin-bottom: 4px;} .toast-description { font-size: 0.9em; opacity: 0.8;} @keyframes toastSlideIn { from { opacity: 0; transform: translateY(100%);} to { opacity: 1; transform: translateY(0);}} @keyframes toastSlideOut { from { opacity: 1; transform: translateY(0);} to { opacity: 0; transform: translateY(100%);}}`;
        document.head.appendChild(style);
    };
    let deltaTime = 0;
    let previousTime = 0;
    let myScratchBlocks;
    if (Scratch.gui) {
        await Scratch.gui.getBlockly().then((ScratchBlocks) => {
            myScratchBlocks = ScratchBlocks;
        });
    }
    class Boolvariable {
        static customId = "boolvariable";
        serialize() {
            return {
                boolVariables: this.boolVariables,
                boolVariablesinfo: this.boolVariablesinfo,
            };
        }
        deserialize(data) {
            this.boolVariables = data.boolVariables;
            this.boolVariablesinfo = data.boolVariablesinfo;
        }
        constructor() {
            this.boolVariables = {};
            this.boolVariablesinfo = {};
            this.isUIOpen = false;
            this.isDelUIOpen = false;
            this.frameCount = 0;
            this.customId = Boolvariable.customId;
            this.type = Boolvariable.customId;
            injectStyles();
            this.jQueryinstaller();
        }
        async jQueryinstaller() {
            try {
                const mod =
                    await import("https://code.jquery.com/jquery-4.0.0.module.min.js");
                const $ = mod.default;
                window.$ = $;
                this.isLoaded = true;
                console.log(`jQuery v${$.fn.jquery} 読み込み完了！`);
            } catch (e) {
                this.isLoaded = false;
                console.warn("jQueryのロードに失敗しました:", e);
                console.warn("jQueryのロードに失敗したため、機能が一部利用不可能となります");
            }
        }
        refreshBlocks() {
            setTimeout(() => {
                Scratch.vm.extensionManager.refreshBlocks("BV");
            }, 5);
        }
        async _createToast(options) {
            const container = createToastContainer(options.position);
            const toast = document.createElement("div");
            toast.className = "toast";
            const zIndex = styleConfig.toast["--toast-z-index"] || 9999;
            toast.style.zIndex = zIndex;
            const stackSize = parseInt(container.dataset.toasts || "0");
            container.dataset.toasts = stackSize + 1;
            const typeStyle =
                styleConfig.types[options.type] || styleConfig.types.origin;
            Object.entries(typeStyle).forEach(([prop, value]) => {
                toast.style.setProperty(prop, value);
            });
            Object.entries(styleConfig.toast).forEach(([prop, value]) => {
                if (prop !== "soundUrl") {
                    toast.style.setProperty(prop, value);
                }
            });
            toast.style.transform = `translateY(${stackSize * 100}%)`;
            toast.style.transition = "transform 0.3s ease-out";
            if (options.image && (await fetch(options.image))) {
                const img = document.createElement("img");
                img.src = options.image;
                img.alt = "Toast icon";
                if (options.imageRounded) {
                    img.style.borderRadius = "50%";
                }
                toast.appendChild(img);
            }
            const content = document.createElement("div");
            content.className = "toast-content";
            if (options.title) {
                const title = document.createElement("div");
                title.className = "toast-title";
                title.textContent = options.title;
                content.appendChild(title);
            }
            const message = document.createElement("div");
            message.className = options.title
                ? "toast-description"
                : "toast-content";
            message.textContent = options.text;
            content.appendChild(message);
            toast.appendChild(content);
            container.appendChild(toast);
            if (
                toastConfig.soundWhenEnabled === "true" &&
                styleConfig.toast.soundUrl
            ) {
                const audio = new Audio(styleConfig.toast.soundUrl);
                audio.play().catch(() => {});
            }
            const duration =
                parseInt(styleConfig.toast["--toast-duration"]) ||
                defaultStyles.toast["--toast-duration"];
            setTimeout(() => {
                toast.style.animation = `toastSlideOut var(--toast-slide-duration) cubic-bezier(0.4, 0.0, 1, 1) forwards`;
                const toasts = container.querySelectorAll(".toast");
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
            if (
                Object.prototype.hasOwnProperty.call(
                    this.boolVariables,
                    internalKey,
                )
            ) {
                return;
            }
            console.log(
                `💡 未知のデータ「${internalKey}」を検知！自動復元を試みます。`,
            );
            this._createToast({
                type: Cast.toString("origin"),
                image: xmlEscape(icon),
                title: xmlEscape(Cast.toString("変数を復元しました")),
                text: xmlEscape(
                    Cast.toString(`変数: ${internalKey}を復元しました`),
                ),
                position: Cast.toString("bottom-right"),
            });
            let displayName = internalKey;
            let isLocal = false;
            let targetId = "stage";
            if (internalKey.includes("_")) {
                const lastIndex = internalKey.lastIndexOf("_");
                isLocal = true;
                targetId = internalKey.substring(0, lastIndex);
                displayName = internalKey.substring(lastIndex + 1);
            } else {
                displayName = internalKey;
                isLocal = false;
                targetId = "stage";
            }
            this.boolVariables[internalKey] = false;
            this.boolVariablesinfo[internalKey] = {
                isLocal: isLocal,
                targetId: targetId,
                displayName: displayName,
            };
            this.refreshBlocks();
        }
        getInfo() {
            return {
                id: "BV",
                name: "Bool変数拡張",
                menuIconURI: icon,
                color1: "#ff8c1a",
                color2: "#ff8000",
                color3: "#db6d00",
                blocks: [
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "真偽値変数",
                    },
                    {
                        opcode: "createUI",
                        blockType: Scratch.BlockType.BUTTON,
                        text: "変数作成フォームを開く",
                    },
                    {
                        opcode: "setBool",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "bool値[variable]を[bool]にする",
                        arguments: {
                            variable: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "boolVariableMenu",
                            },
                            bool: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "staticBoolMenu",
                            },
                        },
                    },
                    {
                        opcode: "getBool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "bool値[variable]",
                        arguments: {
                            variable: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "boolVariableMenu",
                            },
                        },
                    },
                    {
                        opcode: "ifBool",
                        blockType: Scratch.BlockType.EVENT,
                        text: "bool値[variable]が[bool]になった時",
                        isEdgeActivated: false, // startHats連動のイベント型
                        arguments: {
                            variable: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "boolVariableHatMenu",
                            },
                            bool: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "staticBoolMenu",
                            },
                        },
                    },
                    {
                        opcode: "getallBool",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "全部のbool値を見る",
                    },
                    {
                        opcode: "getallboolinfo",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "全部のbool値の情報を見る",
                    },
                    "---",
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "その他のキット",
                    },
                    {
                        opcode: "reversebool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "![bool]",
                        arguments: {
                            bool: { type: Scratch.ArgumentType.BOOLEAN },
                        },
                    },
                    {
                        opcode: "andbool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "[bool1] && [bool2]",
                        arguments: {
                            bool1: { type: Scratch.ArgumentType.BOOLEAN },
                            bool2: { type: Scratch.ArgumentType.BOOLEAN },
                        },
                    },
                    {
                        opcode: "orbool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "[bool1] || [bool2]",
                        arguments: {
                            bool1: { type: Scratch.ArgumentType.BOOLEAN },
                            bool2: { type: Scratch.ArgumentType.BOOLEAN },
                        },
                    },
                    {
                        opcode: "xorbool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "[bool1] !== [bool2]",
                        arguments: {
                            bool1: { type: Scratch.ArgumentType.BOOLEAN },
                            bool2: { type: Scratch.ArgumentType.BOOLEAN },
                        },
                    },
                    {
                        opcode: "waitFrames",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "[frames] フレーム待つ",
                        arguments: {
                            frames: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1,
                            },
                        },
                    },
                    
                    {
                        opcode: "setFps",
                        text: "fpsを [fps] にする",
                        blockType: "command",
                        arguments: {
                            "fps": {
                                type: "number",
                                defaultValue: 30,
                            },
                        },
                    },
                    {
                        opcode: "fps",
                        text: "fps",
                        blockType: "reporter",
                        arguments: {},
                    },
                ],
                menus: {
                    boolVariableMenu: {
                        acceptReporters: false,
                        items: "getVariableMenuItems",
                    },
                    boolVariableHatMenu: {
                        acceptReporters: false,
                        items: "getVariableMenuItems",
                    },
                    staticBoolMenu: {
                        acceptReporters: false,
                        items: [
                            { text: "true", value: "true" },
                            { text: "false", value: "false" },
                        ],
                    },
                },
            };
        }
        createUI() {
            try {
                const self = this;
                myScratchBlocks.prompt(
                    "新しい変数名:",
                    "",
                    (name, more_vars, { scope }) => {
                        if (!name || name.trim() === "") {
                            return;
                        }
                        const trimmedName = name.trim();
                        const editingTarget =
                            Scratch.vm.runtime.getEditingTarget();
                        const currentTargetId = editingTarget
                            ? (editingTarget.id ?? "stage")
                            : "stage";
                        const isLocal = scope === "local";
                        const targetId = isLocal ? currentTargetId : "stage";
                        const internalKey = isLocal
                            ? `${targetId}_${trimmedName}`
                            : trimmedName;
                        for (const key of Object.keys(self.boolVariablesinfo)) {
                            const info = self.boolVariablesinfo[key];
                            if (info.displayName === trimmedName) {
                                if (!isLocal && !info.isLocal) {
                                    alert(`「${trimmedName}」は既に存在します`);
                                    return;
                                }
                                if (
                                    isLocal &&
                                    info.isLocal &&
                                    info.targetId === targetId
                                ) {
                                    alert(`「${trimmedName}」は既に存在します`);
                                    return;
                                }
                            }
                        }
                        self.boolVariables[internalKey] = false; // ← typo 修正
                        self.boolVariablesinfo[internalKey] = {
                            isLocal: isLocal,
                            targetId: targetId,
                            displayName: trimmedName,
                        };
                        return;
                    },
                    "新しい変数",
                    Boolvariable.customId,
                );
            } catch (err) {}
        }
        createUI_turbowarp(){
            if (this.isUIOpen) return;
            this.isUIOpen = true;

            const editingTarget = Scratch.vm.runtime.getEditingTarget();
            const isStage = editingTarget ? !!editingTarget.isStage : false;
            const currentTargetId = editingTarget ? (editingTarget.id ?? 'stage') : 'stage';

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

            overlay.onclick = (e) => {
                if (e.target === overlay) close();
            };

            document.getElementById('ceoCloseXBtn').onclick = close;
            document.getElementById('cancelBtn').onclick = close;

            document.getElementById('okBtn').onclick = () => {
                const name = document.getElementById('varInput').value;
                if (name && name.trim() !== "") {
                    const trimmedName = name.trim();
                    const scopeValue = (document.querySelector('input[name="variableScopeOption"]:checked') ?? { value: 'global' }).value;
                    
                    const isLocal = isStage ? false : (scopeValue === 'local');
                    const targetId = isLocal ? currentTargetId : 'stage';
                    
                    let isDuplicate = false;

                    for (const existingKey of Object.keys(this.boolVariables)) {
                        const info = this.boolVariablesinfo[existingKey];
                        const existingDisplayName = info ? (info.displayName ?? existingKey) : existingKey;

                        if (existingDisplayName === trimmedName) {
                            if (!isLocal) {
                                isDuplicate = true;
                                break;
                            } else {
                                if (!info || !info.isLocal || info.targetId === targetId) {
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

                    const internalKey = isLocal ? `${targetId}_${trimmedName}` : trimmedName;
                    
                    this.boolVariables[internalKey] = false;
                    this.boolVariablesinfo[internalKey] = {
                        isLocal: isLocal,
                        targetId: targetId,
                        displayName: trimmedName
                    };
                    
                    setTimeout(() => {
                        if (Scratch.vm && Scratch.vm.runtime) {
                            Scratch.vm.runtime.requestBlocksDisplayUpdate();
                        }
                    }, 50);
                }
                close();
            };

            document.getElementById('varInput').onkeypress = (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('okBtn').click();
                }
            };
        }
        getVariableMenuItems(currentlySelectedValue) {
            const menuItems = [];
            const currentTarget = Scratch.vm.runtime.getEditingTarget();
            const currentTargetId = currentTarget
                ? (currentTarget.id ?? "stage")
                : "stage";
            const variableKeys = Object.keys(this.boolVariables).filter(
                (key) => {
                    const info = this.boolVariablesinfo[key];
                    if (!info) return true;
                    return !info.isLocal || info.targetId === currentTargetId;
                },
            );
            if (variableKeys.length > 0) {
                for (const key of variableKeys) {
                    const info = this.boolVariablesinfo[key];
                    const dispName = info ? (info.displayName ?? key) : key;
                    menuItems.push({ text: dispName, value: key });
                }
                menuItems.push({
                    text: "変数を削除するフォームを開く",
                    value: "OPEN_DELETE_UI",
                });
            } else {
                menuItems.push({ text: "(空)", value: "(空)" });
            }
            menuItems.push({
                text: "テストフォームを開く",
                value: "OPEN_TEST_UI",
            });
            return menuItems;
        }
        async createDeleteUI() {
            const currentTarget = Scratch.vm.runtime.getEditingTarget();
            const currentTargetId = currentTarget
                ? (currentTarget.id ?? "stage")
                : "stage";
            const deleteableKeys = Object.keys(this.boolVariables).filter(
                (internalKey) => {
                    const info = this.boolVariablesinfo[internalKey];
                    if (!info) return true;
                    return !info.isLocal || info.targetId === currentTargetId;
                },
            );
            if (deleteableKeys.length === 0) {
                alert("❌ このスプライトで削除できる変数がありません！");
                return;
            }
            const select = document.createElement("select");
            select.style.width = "100%";
            select.style.padding = "8px";
            select.style.marginBottom = "20px";
            deleteableKeys.forEach((key) => {
                const info = this.boolVariablesinfo[key];
                const dispName = info?.displayName || key;
                const typeText = info
                    ? info.isLocal
                        ? "[ローカル]"
                        : "[グローバル]"
                    : "[不明]";

                const option = document.createElement("option");
                option.value = key;
                option.textContent = `${typeText} ${dispName}`;
                select.appendChild(option);
            });
            const modal = await myScratchBlocks.customPrompt(
                {
                    title: "変数の削除",
                    text: "削除する変数を選択してください:",
                    onCancel: () => {
                        this.isDelUIOpen = false;
                    },
                },
                {
                    content: { width: "300px" },
                },
                [
                    {
                        name: "削除",
                        role: "ok",
                        callback: () => {
                            const selectedKey = select.value;
                            if (!selectedKey) return;

                            const dispname =
                                select.options[select.selectedIndex].text;

                            if (confirm(`本当に bool値「${dispname}」を完全に削除しますか？`)) {
                                delete this.boolVariables[selectedKey];
                                delete this.boolVariablesinfo[selectedKey];
                                alert(`🎉 bool値「${dispname}」を完全に削除しました！`,);
                                this.refreshBlocks();
                            }
                            this.isDelUIOpen = false;
                        },
                    },
                    {
                        name: "キャンセル",
                        role: "close",
                        callback: () => {
                            this.isDelUIOpen = false;
                        },
                    },
                ],
            );
            modal.appendChild(select);
        }
        createDeleteUI_turbowarp(){
            if (this.isDelUIOpen) return;
            this.isDelUIOpen = true;

            setTimeout(() => {
                const currentTarget = Scratch.vm.runtime.getEditingTarget();
                const currentTargetId = currentTarget ? (currentTarget.id ?? 'stage') : 'stage';

                const deleteableKeys = Object.keys(this.boolVariables).filter(internalKey => {
                    const info = this.boolVariablesinfo[internalKey];
                    if (!info) return true;
                    return !info.isLocal || info.targetId === currentTargetId;
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
                    const disp = info ? (info.displayName ?? key) : key;
                    const typeText = info ? (info.isLocal ? '[ローカル]' : '[グローバル]') : '[不明]';
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
                    const dispName = info ? (info.displayName ?? targetKey) : targetKey;

                    if (confirm(`本当に bool値「${dispName}」を完全に削除しますか？\n(この変数を使用している他のブロックは初期状態に戻ります)`)) {
                        delete this.boolVariables[targetKey];
                        delete this.boolVariablesinfo[targetKey];

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
        test() {
            /*
            const modalCss = `<style>
                .custom-modal{position:fixed;bottom:0;left:50%;transform:translateX(-50%) translateY(0);width:90%;max-width:500px;height:400px;border-top-left-radius:20px;border-top-right-radius:20px;background:#fff;box-shadow:0 -4px 20px rgba(0,0,0,0.15);display:flex;flex-direction:column;z-index:9999;box-sizing:border-box;transition:transform 0.3s cubic-bezier(0.25,1,0.5,1);touch-action:none;user-select:none;-webkit-user-select:none;}
                .custom-modal.dragging{transition:none;}
                .modal-handle-area{padding:12px 0;cursor:grab;touch-action:none;display:flex;justify-content:center;align-items:center;flex-shrink:0;}
                .modal-handle-bar{width:60px;height:6px;background:#d1d5db;border-radius:10px;pointer-events:none;}
                .modal-content{flex:1;overflow-y:auto;padding:10px 20px 20px;box-sizing:border-box;touch-action:pan-y;}
            </style>`;
            $("head").append(modalCss);
            $("body").append(
               `<div class="custom-modal">
                    <div class="modal-handle-area">
                        <div class="modal-handle-bar"></div>
                    </div>
                    <div class="modal-content">
                        <p>コンテンツ</p>
                    </div>
                </div>`,
            );
            const $m = $(".custom-modal"),
                h = $m.outerHeight();
            let sy = 0,
                cy = 0,
                flag = false;
            $(".modal-handle-area").on("touchstart mousedown", (e) => {
                flag = true;
                $m.addClass("dragging");
                sy = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
                cy = 0;
            });
            $(window).on("touchmove mousemove", (e) => {
                if (!flag) return;
                cy = Math.max(
                    0,
                    (e.type === "touchmove"
                        ? e.touches[0].clientY
                        : e.clientY) - sy,
                );
                $m.css("transform", `translateX(-50%) translateY(${cy}px)`);
            });
            $(window).on("touchend mouseup", () => {
                if (!flag) return;
                flag = false;
                $m.removeClass("dragging");
                if (1 - cy / h >= 0.7) {
                    $m.css("transform", "translateX(-50%) translateY(0px)");
                } else {
                    $m.css("transform", `translateX(-50%) translateY(${h}px)`);
                    setTimeout(() => $m.remove(), 300);
                }
            });
            */
            createCustomModal({
                title: "新しい変数",
                text: "新しい変数名:",
                extraHtml: `
                    <input type="text" id="modal-input" placeholder="" style="width:100%;padding:10px;margin-bottom:15px;border:1px solid #d1d5db;border-radius:8px;box-sizing:border-box;">
                    <label style="display:block;margin-bottom:10px;"><input type="radio" name="opt" value="global" checked>すべてのスプライト用</label>
                    <label style="display:block;margin-bottom:10px;"><input type="radio" name="opt" value="local">このスプライト用</label>
                `,
                customCss: `
                    .custom-modal input[type="text"]:focus {
                        border-color: #3b82f6;
                        outline: none;
                    }
                `
            });
        }
        setBool(args, util) {
            if (args.variable === "OPEN_DELETE_UI") {
                this.createDeleteUI();
                return;
            }
            if (args.variable === "OPEN_TEST_UI") {
                this.test();
                return;
            }
            if (args.variable === "(空)") return;
            this.ensureVariableExists(args.variable);
            const prevalue = this.boolVariables[args.variable];
            this.boolVariables[args.variable] = args.bool === "true";
            const data = {
                variable: args.variable.toString(),
                bool: String(args.bool),
            };
            if (prevalue != (args.bool === "true")) {
                Scratch.vm.runtime.startHats("BV_ifBool", data, false);
            }
        }
        getBool(args, util) {
            if (args.variable === "OPEN_DELETE_UI") {
                this.createDeleteUI();
                return false;
            }
            if (args.variable === "IGNORE_CLICK" || args.variable === "(空)")
                return false;
            this.ensureVariableExists(args.variable);
            return !!this.boolVariables[args.variable];
        }
        ifBool(args, util) {
            if (args.variable === "IGNORE_CLICK" || args.variable === "(空)")
                return false;
            return (
                args.variable === util.currentBackgroundData.variable &&
                args.bool === util.currentBackgroundData.bool
            );
        }
        getallBool(args) {
            return JSON.stringify(this.boolVariables);
        }
        getallboolinfo(args) {
            return JSON.stringify(this.boolVariablesinfo);
        }
        reversebool(args, util) {
            return !args.bool;
        }
        andbool(args, util) {
            return !!(args.bool1 && args.bool2);
        }
        orbool(args, util) {
            return !!(args.bool1 || args.bool2);
        }
        xorbool(args, util) {
            return args.bool1 !== args.bool2;
        }
        async waitFrames(args, util) {
            const targetFrame = this.frameCount + args.frames - 1;
            while (this.frameCount < targetFrame) {
                await new Promise((resolve) => requestAnimationFrame(resolve));
            }
        }
        async setFps(args) {
            Scratch.vm.runtime.frameLoop.setFramerate(args["fps"]);
        }
        async fps(args) {
            return Scratch.vm.runtime.frameLoop.framerate;
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
