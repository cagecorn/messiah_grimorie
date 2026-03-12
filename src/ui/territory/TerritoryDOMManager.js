import Logger from '../../utils/Logger.js';
import domManager from '../DOMManager.js';
import localizationManager from '../../core/LocalizationManager.js';
import EventBus, { EVENTS } from '../../core/EventBus.js';

/**
 * 영지 DOM 매니저 (Territory DOM Manager)
 * 역할: [라우터 & 영지 UI 시각화]
 * 
 * 설명: 영지 씬 중앙의 퀵 메뉴들을 프리미엄 카드 형태로 렌더링합니다.
 */
class TerritoryDOMManager {
    constructor() {
        this.ui_container = null;
        Logger.system("TerritoryDOMManager: Initialized (UI Router ready).");
    }

    /**
     * 영지 메인 UI 초기화
     */
    ui_init() {
        if (this.ui_container) {
            this.ui_container.style.display = 'grid';
            return;
        }

        this.ui_container = document.createElement('div');
        this.ui_container.className = 'mg-territory-menu';
        this.ui_container.style.pointerEvents = 'auto'; // 마우스 이벤트 활성화

        const menuConfigs = [
            { id: 'roster', title: 'menu_roster_title', desc: 'menu_roster_desc', img: 'roster_card.png', color: 'yellow' },
            { id: 'shop', title: 'menu_shop_title', desc: 'menu_shop_desc', img: 'shop_card.png', color: 'blue' },
            { id: 'gacha', title: 'menu_gacha_title', desc: 'menu_gacha_desc', img: 'gacha_card.png', color: 'purple' },
            { id: 'equipment', title: 'menu_equipment_title', desc: 'menu_equipment_desc', img: 'equip_card.png', color: 'purple' },
            { id: 'pets', title: 'menu_pets_title', desc: 'menu_pets_desc', img: 'pet_card.png', color: 'green' },
            { id: 'npc', title: 'menu_npc_title', desc: 'menu_npc_desc', img: 'npc_card.png', color: 'yellow' },
            { id: 'messiah', title: 'menu_messiah_title', desc: 'menu_messiah_desc', img: 'messiah_card.png', color: 'white' },
            { id: 'structures', title: 'menu_structures_title', desc: 'menu_structures_desc', img: 'structure_card.png', color: 'green' },
            { id: 'achievements', title: 'menu_achievements_title', desc: 'menu_achievements_desc', img: 'achievement_card.png', color: 'red' },
            { id: 'monster', title: 'menu_monster_title', desc: 'menu_monster_desc', img: 'monster_card.png', color: 'yellow' },
            { id: 'cooking', title: 'menu_cooking_title', desc: 'menu_cooking_desc', img: 'cook_card.png', color: 'red' },
            { id: 'fishing', title: 'menu_fishing_title', desc: 'menu_fishing_desc', img: 'fish_card.png', color: 'blue' },
            { id: 'alchemy', title: 'menu_alchemy_title', desc: 'menu_alchemy_desc', img: 'alchemy_card.png', color: 'green' },
            { id: 'mining', title: 'menu_mining_title', desc: 'menu_mining_desc', img: 'mine_card.png', color: 'blue' },
            { id: 'logging', title: 'menu_logging_title', desc: 'menu_logging_desc', img: 'log_card.png', color: 'purple' },
            { id: 'focus', title: 'menu_focus_title', desc: 'menu_focus_desc', img: 'focus_card.png', color: 'purple' }
        ];

        menuConfigs.forEach(conf => {
            const card = this.createCard(conf);
            this.ui_container.appendChild(card);
        });

        // UI 레이어에 추가
        domManager.addToLayer('ui', this.ui_container);

        // 언어 변경 리스너
        EventBus.on(EVENTS.LANGUAGE_CHANGED, () => this.updateTexts());

        // 씬 전환 시 UI 숨기기 리스너
        EventBus.on(EVENTS.TRANSITION_START, () => this.ui_hide());
    }

    createCard(conf) {
        const card = document.createElement('div');
        card.className = `mg-menu-card mg-card-${conf.color}`;
        card.dataset.id = conf.id;
        
        const left = document.createElement('div');
        left.className = 'mg-card-left';
        const img = document.createElement('img');
        // 에셋 경로 (임시)
        img.src = `assets/ui/menu/${conf.img}`;
        img.onerror = () => { img.style.display = 'none'; }; // 이미지 없을 때 처리
        left.appendChild(img);

        const right = document.createElement('div');
        right.className = 'mg-card-right';
        
        const title = document.createElement('div');
        title.className = 'mg-card-title';
        title.dataset.key = conf.title;
        title.innerText = localizationManager.t(conf.title);
        
        const desc = document.createElement('div');
        desc.className = 'mg-card-desc';
        desc.dataset.key = conf.desc;
        desc.innerText = localizationManager.t(conf.desc);

        right.appendChild(title);
        right.appendChild(desc);

        card.appendChild(left);
        card.appendChild(right);

        card.onclick = () => {
            Logger.info("TERRITORY_UI", `Menu selected: ${conf.id}`);
            EventBus.emit(`UI_OPEN_${conf.id.toUpperCase()}`);
        };

        return card;
    }

    updateTexts() {
        if (!this.ui_container) return;
        const titles = this.ui_container.querySelectorAll('.mg-card-title');
        const descs = this.ui_container.querySelectorAll('.mg-card-desc');
        
        titles.forEach(el => el.innerText = localizationManager.t(el.dataset.key));
        descs.forEach(el => el.innerText = localizationManager.t(el.dataset.key));
    }

    /**
     * 특정 구역(건물 등) 오버레이 활성화
     */
    ui_showAreaInfo(areaId) {
        Logger.info("TERRITORY_UI", `Routing UI display for area: ${areaId}`);
    }

    ui_hide() {
        if (this.ui_container) this.ui_container.style.display = 'none';
    }
}

const territoryDOMManager = new TerritoryDOMManager();
export default territoryDOMManager;
