import Logger from '../utils/Logger.js';
import state from '../core/GlobalState.js';
import EventBus, { EVENTS } from '../core/EventBus.js';
import domManager from './DOMManager.js';
import dungeonStageManager from '../systems/DungeonStageManager.js';
import cursedForestManager from '../systems/dungeons/CursedForestManager.js';
import dungeonRoundManager from '../systems/dungeons/DungeonRoundManager.js';

/**
 * 최상단 허드 DOM 매니저 (Top HUD DOM Manager)
 * 역할: [최상위 UI 라우터 & 렌더러]
 */
class TopHUDDOMManager {
    constructor() {
        this.container = null;
        this.elements = {};
        this.dungeonDropdown = null; // [NEW] 던전 리스트 드롭다운
        
        // 스테이지 매니저에 초기 던전 등록
        dungeonStageManager.registerStage('cursed_forest', cursedForestManager);
        
        // 라운드 매니저 초기화 (기록 로드)
        dungeonRoundManager.initialize();
        
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
        this.container.style.pointerEvents = 'auto';

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
        domManager.addToLayer('nav', this.container);

        // 이벤트 리스너 등록
        this.setupListeners();
        
        this.updateAll();
    }

    createLeftSection() {
        const section = document.createElement('div');
        section.className = 'mg-hud-left';

        // [USER 요청] 이모지를 직접 쓰면 이제 GlobalState.p()를 통해 자동으로 에셋으로 치환됩니다.
        this.elements.gold = this.createCurrencyItem(state.p('🪙'), 'gold');
        this.elements.gem = this.createCurrencyItem(state.p('💎'), 'gem');

        section.appendChild(this.elements.gold.container);
        section.appendChild(this.elements.gem.container);

        return section;
    }

    createCurrencyItem(emoji, key) {
        const item = document.createElement('div');
        item.className = 'mg-currency-item';
        
        const icon = document.createElement('span');
        icon.className = 'mg-currency-icon';
        icon.innerHTML = emoji; // HTML(Img 태그) 허용

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
            { key: 'dungeon', event: 'UI_TOGGLE_DUNGEON_LIST' },
            { key: 'arena', event: 'UI_OPEN_ARENA' },
            { key: 'raid', event: 'UI_OPEN_RAID' },
            { key: 'siege', event: 'UI_OPEN_SIEGE' }
        ];

        navConfigs.forEach(conf => {
            // [STABLE] 버튼을 감싸는 래퍼 생성 (드롭다운 앵커 역할)
            const wrapper = document.createElement('div');
            wrapper.className = 'mg-nav-item';
            wrapper.style.position = 'relative';

            const btn = document.createElement('button');
            btn.className = 'mg-nav-button';
            btn.dataset.key = conf.key;
            btn.innerText = state.t(conf.key);
            
            // 던전 버튼인 경우 드롭다운을 래퍼에 추가
            if (conf.key === 'dungeon') {
                this.elements.dungeonBtn = btn;
                this.createDungeonDropdown(wrapper);
            }

            btn.onclick = (e) => {
                if (conf.key === 'dungeon') {
                    this.toggleDungeonDropdown(e);
                } else {
                    Logger.info("UI_HUD", `Nav button clicked: ${conf.key} -> ${conf.event}`);
                    EventBus.emit(conf.event);
                }
            };

            wrapper.appendChild(btn);
            section.appendChild(wrapper);
        });

        return section;
    }

    /**
     * 던전 리스트 드롭다운 UI 생성 (래퍼의 자식으로)
     */
    createDungeonDropdown(parentWrapper) {
        this.dungeonDropdown = document.createElement('div');
        this.dungeonDropdown.id = 'hud-dungeon-dropdown';
        this.dungeonDropdown.className = 'hud-dungeon-dropdown';
        
        // 래퍼 하단에 고정
        this.dungeonDropdown.style.display = 'none';
        this.dungeonDropdown.style.position = 'absolute';
        this.dungeonDropdown.style.top = '100%';
        this.dungeonDropdown.style.left = '0';
        this.dungeonDropdown.style.marginTop = '10px';
        this.dungeonDropdown.style.zIndex = '1000'; // 래퍼 내부에서 최상위
        
        // 클릭 시 이벤트 전파 방지
        this.dungeonDropdown.onclick = (e) => e.stopPropagation();

        this.refreshDungeonList();
        parentWrapper.appendChild(this.dungeonDropdown);
    }

    toggleDungeonDropdown(event) {
        const isVisible = this.dungeonDropdown.style.display === 'block';
        if (isVisible) {
            this.dungeonDropdown.style.display = 'none';
        } else {
            this.refreshDungeonList();
            this.dungeonDropdown.style.display = 'block';
        }
    }

    /**
     * 드롭다운 내용 최신화
     */
    refreshDungeonList() {
        if (!this.dungeonDropdown) return;
        
        this.dungeonDropdown.innerHTML = '';
        const dungeons = [
            { id: 'cursed_forest', nameKey: 'dungeon_cursed_forest_name' }
        ];

        dungeons.forEach(d => {
            const best = dungeonRoundManager.getBestRecord(d.id);
            const item = document.createElement('div');
            item.className = 'dungeon-item';
            item.innerHTML = `
                <div class="dungeon-rank-badge">R${best}</div>
                <span class="dungeon-name">${state.t(d.nameKey || d.id)}</span>
            `;
            item.onclick = (e) => {
                e.stopPropagation(); // 드롭다운 닫힘 방지 대비 (필요시)
                dungeonStageManager.enterStage(d.id);
                this.dungeonDropdown.style.display = 'none';
            };
            this.dungeonDropdown.appendChild(item);
        });
    }

    createRightSection() {
        const section = document.createElement('div');
        section.className = 'mg-hud-right';

        const sysConfigs = [
            { id: 'focus', icon: null, class: 'mg-icon-focus' },
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
                Logger.info("UI_HUD", `System button clicked: ${conf.id} (Emitting UI_OPEN_${conf.id.toUpperCase()})`);
                EventBus.emit(`UI_OPEN_${conf.id.toUpperCase()}`);
            };
            
            section.appendChild(btn);
        });

        return section;
    }

    setupListeners() {
        EventBus.on(EVENTS.LANGUAGE_CHANGED, () => this.updateTexts());
        EventBus.on('CURRENCY_CHANGED', () => this.updateCurrencies());
        EventBus.on('DUNGEON_RECORD_UPDATED', () => this.refreshDungeonList());
    }

    updateTexts() {
        const navButtons = this.elements.center.querySelectorAll('.mg-nav-button');
        navButtons.forEach(btn => {
            btn.innerText = state.t(btn.dataset.key);
        });
    }

    updateCurrencies() {}

    updateAll() {
        this.updateTexts();
        this.updateCurrencies();
    }
}

const topHUDDOMManager = new TopHUDDOMManager();
export default topHUDDOMManager;
