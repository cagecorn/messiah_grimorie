import Logger from '../utils/Logger.js';
import domManager from './DOMManager.js';
import PortraitHUDCard from './PortraitHUDCard.js';

/**
 * 초상화 허드 DOM 매니저 (Portrait HUD DOM Manager)
 * 역할: [허드 컨테이너 관리 및 카드 렌더링]
 */
class PortraitHUDDOMManager {
    constructor() {
        this.container = null;
        this.cards = new Map();
        this.isInitialized = false;
    }

    /**
     * HUD 초기화 및 레이아웃 설정
     * @param {Array} partyMembers 파티 멤버 데이터 목록
     */
    initialize(partyMembers = []) {
        if (this.isInitialized) this.clear();

        // 1. 컨테이너 생성
        this.container = document.createElement('div');
        this.container.id = 'mg-portrait-hud';
        this.container.className = 'mg-portrait-hud';
        
        // 2. 각 멤버별 카드 생성
        partyMembers.forEach(member => {
            const card = new PortraitHUDCard(member);
            const cardElement = card.create();
            this.container.appendChild(cardElement);
            this.cards.set(member.instanceId || member.id, card);
        });

        // 3. UI 레이어에 추가 ('hud' 레이어 사용)
        domManager.addToLayer('hud', this.container);
        
        this.isInitialized = true;
        Logger.system(`PortraitHUDDOMManager: Initialized with ${partyMembers.length} cards.`);
    }

    /**
     * 특정 카드 업데이트
     * @param {string} instanceId 카드 식별자
     */
    updateCard(instanceId, data) {
        const card = this.cards.get(instanceId);
        if (card) {
            card.update(data);
        }
    }

    clear() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.cards.clear();
        this.isInitialized = false;
    }
}

const portraitHUDDOMManager = new PortraitHUDDOMManager();
export default portraitHUDDOMManager;
