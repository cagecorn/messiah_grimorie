import Logger from '../utils/Logger.js';
import state from '../core/GlobalState.js';
import EventBus, { EVENTS } from '../core/EventBus.js';
import domManager from './DOMManager.js';

/**
 * 최상단 허드 DOM 매니저 (Top HUD DOM Manager)
 * 역할: [최상위 UI 라우터 & 렌더러]
 * 
 * 설명: 게임 화면 최상단에 위치한 통화, 네비게이션, 시스템 버튼들을 DOM으로 관리합니다.
 * 하드코딩을 최소화하고 LocalizationManager와 CurrencyManager의 실시간 데이터를 반영합니다.
 */
class TopHUDDOMManager {
    constructor() {
        this.container = null;
        this.elements = {};
        Logger.system("TopHUDDOMManager: Initialized.");
    }

    /**
     * HUD 초기화 및 생성
     */
    initialize() {
        if (this.container) return;

        // 컨테이너 생성
        this.container = document.createElement('div');
        this.container.id = 'mg-top-hud';
        this.container.className = 'mg-top-hud';

        // 1. 왼쪽 구역 (Currency)
        this.elements.left = this.createLeftSection();
        
        // 2. 중앙 구역 (Navigation)
        this.elements.center = this.createCenterSection();
        
        // 3. 오른쪽 구역 (System)
        this.elements.right = this.createRightSection();

        this.container.appendChild(this.elements.left);
        this.container.appendChild(this.elements.center);
        this.container.appendChild(this.elements.right);

        // DOM 매니저를 통해 UI 레이어에 추가
        domManager.addToLayer('ui', this.container);

        // 이벤트 리스너 등록
        this.setupListeners();
        
        this.updateAll();
    }

    createLeftSection() {
        const section = document.createElement('div');
        section.className = 'mg-hud-left';

        // Gold
        this.elements.gold = this.createCurrencyItem('🪙', 'gold');
        // Diamond
        this.elements.gem = this.createCurrencyItem('💎', 'gem');

        section.appendChild(this.elements.gold.container);
        section.appendChild(this.elements.gem.container);

        return section;
    }

    createCurrencyItem(emoji, key) {
        const item = document.createElement('div');
        item.className = 'mg-currency-item';
        
        const icon = document.createElement('span');
        icon.className = 'mg-currency-icon';
        icon.innerText = emoji; // EmojiManager가 나중에 처리하거나, 일단 직접 넣음

        const value = document.createElement('span');
        value.className = 'mg-currency-value';
        value.innerText = '0';

        item.appendChild(icon);
        item.appendChild(value);

        return { container: item, label: value };
    }

    createCenterSection() {
        const section = document.createElement('div');
        section.className = 'mg-hud-center';

        const navConfigs = [
            { key: 'territory', event: 'UI_OPEN_TERRITORY' },
            { key: 'gacha', event: 'UI_OPEN_GACHA' },
            { key: 'formation', event: 'UI_OPEN_FORMATION' },
            { key: 'dungeon', event: 'UI_OPEN_DUNGEON' },
            { key: 'arena', event: 'UI_OPEN_ARENA' },
            { key: 'raid', event: 'UI_OPEN_RAID' },
            { key: 'siege', event: 'UI_OPEN_SIEGE' }
        ];

        navConfigs.forEach(conf => {
            const btn = document.createElement('button');
            btn.className = 'mg-nav-button';
            btn.dataset.key = conf.key;
            btn.innerText = state.t(conf.key);
            btn.onclick = () => EventBus.emit(conf.event);
            section.appendChild(btn);
        });

        return section;
    }

    createRightSection() {
        const section = document.createElement('div');
        section.className = 'mg-hud-right';

        const sysConfigs = [
            { id: 'focus', icon: null, class: 'mg-icon-focus' }, // 나중에 커스텀 아이콘 처리
            { id: 'inventory', icon: 'bag_icon.png' },
            { id: 'music', icon: 'music_icon.png' },
            { id: 'settings', icon: 'setting_icon.png' }
        ];

        sysConfigs.forEach(conf => {
            const btn = document.createElement('div');
            btn.className = 'mg-sys-button';
            btn.title = state.t(conf.id);

            if (conf.icon) {
                const img = document.createElement('img');
                img.src = `assets/icon/${conf.icon}`;
                btn.appendChild(img);
            } else if (conf.class) {
                const iconDiv = document.createElement('div');
                iconDiv.className = conf.class;
                btn.appendChild(iconDiv);
            }

            btn.onclick = () => {
                Logger.info("UI", `System button clicked: ${conf.id}`);
                EventBus.emit(`UI_OPEN_${conf.id.toUpperCase()}`);
            };
            
            section.appendChild(btn);
        });

        return section;
    }

    setupListeners() {
        // 언어 변경 시 텍스트 업데이트
        EventBus.on(EVENTS.LANGUAGE_CHANGED, () => this.updateTexts());
        
        // 재화 변경 시 업데이트 (CurrencyManager와 연동 가정)
        EventBus.on('CURRENCY_CHANGED', () => this.updateCurrencies());
    }

    updateTexts() {
        // 네비게이션 버튼 텍스트 갱신
        const navButtons = this.elements.center.querySelectorAll('.mg-nav-button');
        navButtons.forEach(btn => {
            btn.innerText = state.t(btn.dataset.key);
        });
    }

    updateCurrencies() {
        // [TODO] CurrencyManager에서 실제 값을 가져오도록 연동
        // this.elements.gold.label.innerText = currencyManager.get('gold');
    }

    updateAll() {
        this.updateTexts();
        this.updateCurrencies();
    }
}

const topHUDDOMManager = new TopHUDDOMManager();
export default topHUDDOMManager;
