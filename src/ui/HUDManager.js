import Logger from '../utils/Logger.js';

/**
 * HUD 매니저 (HUD Manager)
 * 역할: [라우터 & 게임 내 오버레이 총괄]
 * 
 * 설명: 상시 표시되는 체력바, 스킬 슬롯, 미니맵 등 HUD 요소를 총괄 라우팅합니다.
 */
class HUDManager {
    constructor() {
        this.subModules = new Map();
        Logger.system("HUDManager Router: Initialized (Overlay dispatcher ready).");
    }

    /**
     * HUD 요소 업데이트 라우팅
     */
    updateHUD(elementId, data) {
        Logger.info("HUD_ROUTER", `Routing update for HUD element: ${elementId}`);
    }

    /**
     * HUD 표시 여부 일괄 제어 라우팅
     */
    setAllVisibility(visible) {
        Logger.info("HUD_ROUTER", `Routing HUD global visibility: ${visible}`);
    }
}

const hudManager = new HUDManager();
export default hudManager;
