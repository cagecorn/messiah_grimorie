import Logger from '../../utils/Logger.js';
import domManager from '../DOMManager.js';

/**
 * 영지 DOM 매니저 (Territory DOM Manager)
 * 역할: [라우터 & 영지 UI 시각화]
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
        Logger.info("TERRITORY_UI", "Initializing territory main DOM layout.");
        // [HARDCODE-FREE] 템플릿 로직이나 외부 소스로부터 UI 구조를 가져옴
    }

    /**
     * 특정 구역(건물 등) 오버레이 활성화
     */
    ui_showAreaInfo(areaId) {
        Logger.info("TERRITORY_UI", `Routing UI display for area: ${areaId}`);
    }
}

const territoryDOMManager = new TerritoryDOMManager();
export default territoryDOMManager;
