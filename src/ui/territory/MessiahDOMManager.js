import Logger from '../../utils/Logger.js';

/**
 * 메시아 DOM 매니저 (Messiah DOM Manager)
 */
class MessiahDOMManager {
    constructor() {
        Logger.system("MessiahDOMManager: Initialized.");
    }

    ui_updateExpBar(level, exp, maxExp) {
        Logger.info("UI_ROUTER", `Updating Messiah Progress Bar: Lv.${level}`);
    }

    ui_openTraitTree() {
        Logger.info("UI_ROUTER", "Opening Messiah Trait Tree UI.");
    }
}

const messiahDOMManager = new MessiahDOMManager();
export default messiahDOMManager;
