import Logger from '../../utils/Logger.js';

/**
 * 용병도감 DOM 매니저 (Mercenary Book DOM Manager)
 */
class MercenaryBookDOMManager {
    constructor() {
        this.ui_isOpen = false;
        Logger.system("MercenaryBookDOMManager: Initialized.");
    }

    ui_open() {
        this.ui_isOpen = true;
        Logger.info("UI_ROUTER", "Opening Mercenary Book UI.");
    }

    ui_renderList(data) {
        Logger.info("UI_ROUTER", "Rendering mercenary collection list.");
    }
}

const mercenaryBookDOMManager = new MercenaryBookDOMManager();
export default mercenaryBookDOMManager;
