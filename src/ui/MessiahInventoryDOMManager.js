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
        this.tabs = null;
        this.currentCategory = 'ALL'; // [NEW] 현재 선택된 카테고리
        this.isOpened = false;
        
        // [DIRTY FLAG]
        this.isDirty = true;
        this.cachedSlots = [];
    }

    initialize() {
        if (this.overlay) return;
        Logger.info("INV_UI", "Initializing MessiahInventoryDOMManager...");

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
        
        // [NEW] 탭바 추가
        this.tabs = document.createElement('div');
        this.tabs.className = 'mg-inventory-tabs';
        const categories = [
            { id: 'ALL', label: 'All' },
            { id: 'CURRENCY', label: 'Currency' },
            { id: 'MATERIAL', label: 'Materials' }
        ];

        categories.forEach(cat => {
            const tab = document.createElement('div');
            tab.className = `mg-inventory-tab ${cat.id === this.currentCategory ? 'active' : ''}`;
            tab.innerText = cat.label;
            tab.dataset.id = cat.id;
            tab.onclick = () => this.setCategory(cat.id);
            this.tabs.appendChild(tab);
        });

        // 그리드
        this.grid = document.createElement('div');
        this.grid.className = 'mg-inventory-grid';
        
        window.appendChild(header);
        window.appendChild(this.tabs);
        window.appendChild(this.grid);
        this.overlay.appendChild(window);
        
        // UI 레이어에 추가
        domManager.addToLayer('ui', this.overlay);
        
        // 오버레이 클릭 시 닫기
        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) this.toggle();
        };
    }

    /**
     * 카테고리 변경 처리
     */
    setCategory(catId) {
        if (this.currentCategory === catId) return;
        
        this.currentCategory = catId;
        
        // 탭 UI 업데이트
        const tabElements = this.tabs.querySelectorAll('.mg-inventory-tab');
        tabElements.forEach(t => {
            t.classList.toggle('active', t.dataset.id === catId);
        });

        // 필터링 시에는 강제로 리랜더링 (Dirty Flag 무시하고 즉시 반영)
        this.isDirty = true;
        this.render();
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
        EventBus.on('UI_OPEN_INVENTORY', () => {
            Logger.info("INV_UI", "Event received: UI_OPEN_INVENTORY");
            this.toggle();
        });

        // [신규] 재화 변경 시에도 인벤토리 더티 플래그 처리
        const refreshFunc = () => {
            this.isDirty = true;
            if (this.isOpened) this.render();
        };
        EventBus.on('CURRENCY_CHANGED_GOLD', refreshFunc);
        EventBus.on('CURRENCY_CHANGED_GEM', refreshFunc);
    }

    toggle() {
        this.isOpened = !this.isOpened;
        Logger.info("INV_UI", `Inventory Toggle: isOpened=${this.isOpened}`);
        
        if (this.overlay) {
            this.overlay.classList.toggle('active', this.isOpened);
        } else {
            Logger.error("INV_UI", "Inventory Overlay is missing during toggle!");
        }
        
        if (this.isOpened && this.isDirty) {
            this.render();
        }
    }

    /**
     * 더티 플래그 기반 렌더링
     */
    async render() {
        if (!this.isDirty) return;
        
        Logger.info("INV_UI", `Re-rendering inventory. Category: ${this.currentCategory}`);
        this.grid.innerHTML = '';
        
        const Registry = (await import('../core/Registry.js')).default;
        const allSlots = messiahInventoryManager.getSlots();
        let displaySlots = [...allSlots];
        
        // [SCALING] 골드/다이아 등 전역 재화를 인벤토리 슬롯에 가상으로 노출 (CURRENCY 탭일 때)
        const state = (await import('../core/GlobalState.js')).default;
        const currencies = [];
        if (this.currentCategory === 'ALL' || this.currentCategory === 'CURRENCY') {
            if (state.economy.gold > 0) {
                currencies.push({ id: 'gold', amount: state.economy.gold, isCurrency: true });
            }
            if (state.economy.gem > 0) {
                currencies.push({ id: 'gem', amount: state.economy.gem, isCurrency: true });
            }
        }

        // [FILTER] 카테고리에 맞춰 필터링
        if (this.currentCategory !== 'ALL') {
            displaySlots = displaySlots.filter(item => {
                if (!item) return false;
                const def = Registry.items.get(item.id);
                return def && def.type === this.currentCategory;
            });
        }

        // 재화와 일반 아이템 합치기 (재화가 항상 앞에 나오도록)
        if (this.currentCategory === 'ALL' || this.currentCategory === 'CURRENCY') {
            displaySlots = [...currencies, ...displaySlots.filter(s => s !== null)];
        }
        
        displaySlots.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'mg-inventory-slot';
            
            if (item) {
                // [FIX] Registry에서 아이콘(이모지)을 먼저 찾고, 없으면 ID를 이모지로 간주
                const def = Registry.items.get(item.id);
                const emoji = (def && def.icon) ? def.icon : item.id;
                const fileName = emojiManager.emojiMap[emoji] || 'default_item.png';
                
                const icon = document.createElement('img');
                icon.className = 'mg-inventory-item-icon';
                icon.src = `assets/emojis/${fileName}`;
                
                const amount = document.createElement('div');
                amount.className = 'mg-inventory-item-amount';
                amount.innerText = (item.amount >= 1000) ? String(item.amount) : item.amount;
                
                slot.appendChild(icon);
                slot.appendChild(amount);
            } else {
                slot.classList.add('empty');
            }
            
            this.grid.appendChild(slot);
        });
        
        // 만약 필터링된 결과가 적더라도 그리드 모양을 유지하고 싶다면 빈 슬롯을 채워줄 수 있음
        const minSlots = 20;
        if (displaySlots.length < minSlots) {
            for (let i = displaySlots.length; i < minSlots; i++) {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'mg-inventory-slot empty';
                this.grid.appendChild(emptySlot);
            }
        }
        
        this.isDirty = false;
    }
}

const messiahInventoryDOMManager = new MessiahInventoryDOMManager();
export default messiahInventoryDOMManager;
