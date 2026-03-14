import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';
import messiahInventoryManager from '../systems/MessiahInventoryManager.js';
import emojiManager from '../core/EmojiManager.js';
import domManager from './DOMManager.js';

/**
 * 메시아 인벤토리 DOM 매니저 (Messiah Inventory DOM Manager)
 * 역할: [인벤토리 UI 렌더링 및 더티 플래그 관리]
 */
class MessiahInventoryDOMManager {
    constructor() {
        this.overlay = null;
        this.grid = null;
        this.isOpened = false;
        
        // [DIRTY FLAG]
        this.isDirty = true;
        this.cachedSlots = [];
    }

    initialize() {
        if (this.overlay) return;

        // CSS 로드 (동적 로드 루틴이 있다면 활용, 여기서는 수동 생성)
        this.createUI();
        this.setupListeners();
        
        Logger.system("MessiahInventoryDOMManager: Initialized with Dirty Flag.");
    }

    createUI() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'mg-inventory-overlay';
        
        const window = document.createElement('div');
        window.className = 'mg-inventory-window';
        
        // 헤더
        const header = document.createElement('div');
        header.className = 'mg-inventory-header';
        header.innerHTML = `
            <div class="mg-inventory-title">Inventory</div>
            <div class="mg-inventory-close">×</div>
        `;
        
        header.querySelector('.mg-inventory-close').onclick = () => this.toggle();
        
        // 그리드
        this.grid = document.createElement('div');
        this.grid.className = 'mg-inventory-grid';
        
        window.appendChild(header);
        window.appendChild(this.grid);
        this.overlay.appendChild(window);
        
        // UI 레이어에 추가
        domManager.addToLayer('ui', this.overlay);
        
        // 오버레이 클릭 시 닫기
        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) this.toggle();
        };
    }

    setupListeners() {
        EventBus.on('INVENTORY_UPDATED', (data) => {
            if (data.ownerId === 'messiah') {
                this.isDirty = true;
                this.cachedSlots = data.slots;
                if (this.isOpened) this.render();
            }
        });

        // HUD 가방 버튼 연동
        EventBus.on('UI_OPEN_INVENTORY', () => this.toggle());
    }

    toggle() {
        this.isOpened = !this.isOpened;
        this.overlay.classList.toggle('active', this.isOpened);
        
        if (this.isOpened && this.isDirty) {
            this.render();
        }
    }

    /**
     * 더티 플래그 기반 렌더링
     */
    render() {
        if (!this.isDirty) return;
        
        Logger.info("INV_UI", "Inventory is dirty. Re-rendering...");
        this.grid.innerHTML = '';
        
        const slots = messiahInventoryManager.getSlots();
        
        slots.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'mg-inventory-slot';
            
            if (item) {
                // 아이템 아이콘 처리 (EmojiManager 활용)
                const textureKey = emojiManager.getAssetKey(item.id) || item.id;
                // [FIX] DOM이므로 EmojiManager.emojiMap에서 실제 파일 경로를 가져옴
                const fileName = emojiManager.emojiMap[item.id] || 'default_item.png';
                
                const icon = document.createElement('img');
                icon.className = 'mg-inventory-item-icon';
                icon.src = `assets/emojis/${fileName}`;
                
                const amount = document.createElement('div');
                amount.className = 'mg-inventory-item-amount';
                amount.innerText = item.amount;
                
                slot.appendChild(icon);
                slot.appendChild(amount);
            } else {
                slot.classList.add('empty');
            }
            
            this.grid.appendChild(slot);
        });
        
        this.isDirty = false;
    }
}

const messiahInventoryDOMManager = new MessiahInventoryDOMManager();
export default messiahInventoryDOMManager;
