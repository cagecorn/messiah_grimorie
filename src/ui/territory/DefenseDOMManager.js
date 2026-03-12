import Logger from '../../utils/Logger.js';

/**
 * 방어 시설 DOM 매니저 (Defense DOM Manager)
 */
class DefenseDOMManager {
    constructor() {
        Logger.system("DefenseDOMManager: Initialized.");
    }

    ui_showFacilityStatus(id) {
        Logger.info("UI_ROUTER", `Displaying defense facility status: ${id}`);
    }

    ui_openBuildMenu() {
        Logger.info("UI_ROUTER", "Opening Defense Construction UI.");
    }
}

const defenseDOMManager = new DefenseDOMManager();
export default defenseDOMManager;
