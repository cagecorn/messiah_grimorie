import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';

/**
 * 퀵 액션 매니저 (Quick Action Manager)
 * 역할: [중간 선택지 메뉴 상태 관리]
 * 
 * 설명: 편성 씬에서 용병을 클릭했을 때, 바로 정보를 볼지 혹은 편성할지 결정하는 
 * 미니 메뉴의 상태를 관리합니다.
 */
class QuickActionManager {
    constructor() {
        this.currentTargetMercId = null;
        this.originElement = null; // 클릭된 위치 정보 (필요 시)
        
        Logger.system("QuickActionManager: Initialized.");
    }

    /**
     * 메뉴 열기 요청
     * @param {string} mercId 대상 용병 ID
     * @param {HTMLElement} origin 클릭된 요소 (위치 계산용)
     */
    requestMenu(mercId, origin) {
        this.currentTargetMercId = mercId;
        this.originElement = origin;
        
        Logger.info("QUICK_ACTION", `Opening menu for: ${mercId}`);
        EventBus.emit('UI_OPEN_QUICK_ACTION', { mercId, origin });
    }

    closeMenu() {
        this.currentTargetMercId = null;
        this.originElement = null;
        EventBus.emit('UI_CLOSE_QUICK_ACTION');
    }
}

const quickActionManager = new QuickActionManager();
export default quickActionManager;
