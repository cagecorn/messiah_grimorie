import Logger from '../utils/Logger.js';
import EventBus, { EVENTS } from '../core/EventBus.js';
import domManager from './DOMManager.js';
import localizationManager from '../core/LocalizationManager.js';
import quickActionManager from '../systems/QuickActionManager.js';
import characterInfoManager from '../systems/CharacterInfoManager.js';
import formationManager from '../systems/FormationManager.js';
import mercenaryManager from '../systems/entities/MercenaryManager.js';
import mercenaryCollectionManager from '../systems/MercenaryCollectionManager.js';

/**
 * 퀵 액션 DOM 매니저 (Quick Action DOM Manager)
 * 역할: [중간 선택지 메뉴 렌더링 및 이벤트 라우팅]
 */
class QuickActionDOMManager {
    constructor() {
        this.container = null;
        this.setupListeners();
    }

    setupListeners() {
        EventBus.on('UI_OPEN_QUICK_ACTION', (data) => {
            this.show(data.mercId, data.origin);
        });

        EventBus.on('UI_CLOSE_QUICK_ACTION', () => {
            this.hide();
        });
    }

    show(mercId, origin) {
        if (!this.container) {
            this.createUI();
        }
        
        const registryData = mercenaryManager.registry[mercId.toLowerCase()];
        if (!registryData) return;

        this.container.style.display = 'flex';
        
        // 메뉴 내용 갱신
        const menu = this.container.querySelector('.quick-action-menu');
        menu.innerHTML = `
            <div class="quick-action-header">${registryData.name}</div>
            <button class="quick-action-btn primary" onclick="QUICK_ACTION_EXECUTE('info')">
                <span class="bracket">[</span>
                ${localizationManager.t('ui_action_view_info')}
                <span class="bracket">]</span>
            </button>
            <button class="quick-action-btn" onclick="QUICK_ACTION_EXECUTE('assign')">
                <span class="bracket">[</span>
                ${localizationManager.t('ui_action_assign')}
                <span class="bracket">]</span>
            </button>
        `;

        // 전역 함수 바인딩
        window.QUICK_ACTION_EXECUTE = (action) => this.executeAction(action, mercId);
    }

    executeAction(action, mercId) {
        quickActionManager.closeMenu();

        if (action === 'info') {
            // 상세 정보창 열기 (Source: collection)
            const registryData = mercenaryManager.registry[mercId.toLowerCase()] || {};
            const ownedData = mercenaryCollectionManager.getMercenaryData(mercId) || { 
                id: mercId, 
                name: registryData.name || mercId,
                type: 'mercenary' // 기본적으로 용병으로 간주
            }; 
            characterInfoManager.setTarget(ownedData, 'collection');
        } else if (action === 'assign') {
            // 파티 편성 (자동 빈 슬롯 찾기)
            const currentFormation = formationManager.getFormation();
            const emptySlot = currentFormation.indexOf(null);
            
            if (emptySlot !== -1) {
                formationManager.assignMercenary(emptySlot, mercId);
                // 편성 결과 반영을 위해 COLLECTION_UPDATED나 유사 이벤트가 필요할 수 있음
                // 하지만 FormationDOMManager가 이미 refresh()를 이벤트 기반으로 하거나 직접 호출함.
                // 여기서는 FormationDOMManager의 refresh를 유도하기 위해 이벤트를 쏨.
                EventBus.emit('COLLECTION_UPDATED'); 
            } else {
                Logger.warn("QUICK_ACTION", "No empty slots available for assignment.");
                // 토스트 메시지 등이 있으면 좋음
            }
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.className = 'quick-action-overlay';
        this.container.onclick = () => quickActionManager.closeMenu();

        const menu = document.createElement('div');
        menu.className = 'quick-action-menu';
        menu.onclick = (e) => e.stopPropagation();

        this.container.appendChild(menu);
        domManager.addToLayer('overlay', this.container);
    }
}

const quickActionDOMManager = new QuickActionDOMManager();
export default quickActionDOMManager;
