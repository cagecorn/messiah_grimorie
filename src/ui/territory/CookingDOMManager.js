import Logger from '../../utils/Logger.js';

/**
 * 요리 DOM 매니저 (Cooking DOM Manager)
 */
class CookingDOMManager {
    constructor() {
        Logger.system("CookingDOMManager: Initialized.");
    }

    ui_openKitchen() {
        Logger.info("UI_ROUTER", "Opening Cooking/Kitchen UI.");
    }

    ui_showResult(dishId) {
        Logger.info("UI_ROUTER", `Routing visual result for dish: ${dishId}`);
    }
}

const cookingDOMManager = new CookingDOMManager();
export default cookingDOMManager;
