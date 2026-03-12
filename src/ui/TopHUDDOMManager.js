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

        // [NEW] 던전 드롭다운 생성
        this.createDungeonDropdown();

        // 이벤트 리스너 등록
        this.setupListeners();
        
        this.updateAll();
    }

    createLeftSection() {
        const section = document.createElement('div');
        section.className = 'mg-hud-left';

        this.elements.gold = this.createCurrencyItem('🪙', 'gold');
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
        icon.innerText = emoji;

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
            const btn = document.createElement('button');
            btn.className = 'mg-nav-button';
            btn.dataset.key = conf.key;
            btn.innerText = state.t(conf.key);
            btn.onclick = (e) => {
                if (conf.key === 'dungeon') {
                    this.toggleDungeonDropdown(e);
                } else {
                    Logger.info("UI_HUD", `Nav button clicked: ${conf.key} -> ${conf.event}`);
                    EventBus.emit(conf.event);
                }
            };
            section.appendChild(btn);
        });

        return section;
    }

    /**
     * 던전 리스트 드롭다운 UI 생성
     */
    createDungeonDropdown() {
        this.dungeonDropdown = document.createElement('div');
        this.dungeonDropdown.id = 'hud-dungeon-dropdown';
        this.dungeonDropdown.className = 'hud-dungeon-dropdown';
        this.dungeonDropdown.style.display = 'none';
        
        // 초기 리스트 생성
        this.refreshDungeonList();
        
        this.container.appendChild(this.dungeonDropdown);
    }

    toggleDungeonDropdown(event) {
        // [IMPORTANT] event.target 대신 currentTarget을 사용해야 버튼의 정확한 위치를 잡음
        const btn = event.currentTarget;
        const isVisible = this.dungeonDropdown.style.display === 'block';
        
        if (isVisible) {
            this.dungeonDropdown.style.display = 'none';
        } else {
            // 열기 전에 기록 최신화
            this.refreshDungeonList();
            
            this.dungeonDropdown.style.display = 'block';
            
            // 안정적인 좌표 계산: 버튼의 위치를 HUD 컨테이너 기준으로 변환
            const btnRect = btn.getBoundingClientRect();
            const hudRect = this.container.getBoundingClientRect();
            
            this.dungeonDropdown.style.position = 'absolute';
            // 버튼 정중앙 하단 배치를 위해 (left = 버튼중앙 - 드롭다운절반) 도 가능하지만 일단 단순하게
            this.dungeonDropdown.style.top = `${btnRect.bottom - hudRect.top + 10}px`;
            this.dungeonDropdown.style.left = `${btnRect.left - hudRect.left}px`;
        }
    }

    /**
     * 드롭다운 내용 최신화
     */
    refreshDungeonList() {
        if (!this.dungeonDropdown) return;
        
        this.dungeonDropdown.innerHTML = '';
        const dungeons = [
            { id: 'cursed_forest', name: '저주받은 숲' }
        ];

        dungeons.forEach(d => {
            const best = dungeonRoundManager.getBestRecord(d.id);
            const item = document.createElement('div');
            item.className = 'dungeon-item';
            item.innerHTML = `
                <div class="dungeon-rank-badge">R${best}</div>
                <span class="dungeon-name">${d.name}</span>
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
                Logger.info("UI", `System button clicked: ${conf.id}`);
                EventBus.emit(`UI_OPEN_${conf.id.toUpperCase()}`);
            };
            
            section.appendChild(btn);
        });

        return section;
    }

    setupListeners() {
        EventBus.on(EVENTS.LANGUAGE_CHANGED, () => this.updateTexts());
        EventBus.on('CURRENCY_CHANGED', () => this.updateCurrencies());
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
