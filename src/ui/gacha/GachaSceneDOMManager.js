import Logger from '../../utils/Logger.js';
import domManager from '../DOMManager.js';
import localizationManager from '../../core/LocalizationManager.js';
import EventBus, { EVENTS } from '../../core/EventBus.js';
import gachaManager from '../../systems/GachaManager.js';

/**
 * 가챠 씬 DOM 매니저 (Gacha Scene DOM Manager)
 * 역할: [소환 화면 UI 인터페이스 관리]
 */
class GachaSceneDOMManager {
    constructor() {
        this.container = null;
        this.collectionPanel = null;
        Logger.system("GachaSceneDOMManager: Initialized.");
    }

    ui_init() {
        if (this.container) {
            this.container.style.display = 'flex';
            this.updateCollection();
            return;
        }

        // 전체 오버레이 컨테이너
        this.container = document.createElement('div');
        this.container.className = 'mg-gacha-overlay';
        this.container.style.pointerEvents = 'auto'; // 마우스 이벤트 활성화

        // 1. 소환 버튼 구역
        const controls = document.createElement('div');
        controls.className = 'mg-gacha-controls';

        const btnMulti = this.createSummonBtn('mercenary_multi', 'gacha_summon_5', '500 💎', 'multi');
        const btnPet = this.createSummonBtn('pet', 'gacha_summon_pet', '1000 💎');
        const btnSingle = this.createSummonBtn('mercenary_single', 'gacha_summon_mercenary', '10,000 🪙');

        controls.appendChild(btnMulti);
        controls.appendChild(btnPet);
        controls.appendChild(btnSingle);

        // 2. 보유 현황 패널 (왼쪽)
        this.collectionPanel = document.createElement('div');
        this.collectionPanel.className = 'mg-gacha-collection';
        this.updateCollection();

        this.container.appendChild(controls);
        this.container.appendChild(this.collectionPanel);

        // UI 레이어에 추가
        domManager.addToLayer('ui', this.container);

        // 언어 변경 리스너
        EventBus.on(EVENTS.LANGUAGE_CHANGED, () => this.updateTexts());

        // 씬 전환 시 UI 숨기기 리스너
        EventBus.on(EVENTS.TRANSITION_START, () => this.ui_hide());
    }

    createSummonBtn(type, key, costText, extraClass = '') {
        const btn = document.createElement('button');
        btn.className = `mg-summon-btn ${extraClass}`;
        
        const label = document.createElement('span');
        label.className = 'label';
        label.dataset.key = key;
        label.innerText = localizationManager.t(key);

        const cost = document.createElement('span');
        cost.className = 'cost';
        cost.innerText = costText;

        btn.appendChild(label);
        btn.appendChild(cost);

        btn.onclick = () => gachaManager.attemptSummon(type);
        return btn;
    }

    updateCollection() {
        if (!this.collectionPanel) return;
        
        this.collectionPanel.innerHTML = '';
        
        const title = document.createElement('h3');
        title.dataset.key = 'gacha_collection_title';
        title.innerText = localizationManager.t('gacha_collection_title');
        this.collectionPanel.appendChild(title);

        const list = document.createElement('div');
        list.className = 'mg-collection-list';
        // [TODO] MercenaryCollectionManager 연동 시 동적 렌더링 예정
        
        this.collectionPanel.appendChild(list);
    }

    updateTexts() {
        if (!this.container) return;
        const labels = this.container.querySelectorAll('[data-key]');
        labels.forEach(el => el.innerText = localizationManager.t(el.dataset.key));
    }

    ui_hide() {
        if (this.container) this.container.style.display = 'none';
    }
}

const gachaSceneDOMManager = new GachaSceneDOMManager();
export default gachaSceneDOMManager;
