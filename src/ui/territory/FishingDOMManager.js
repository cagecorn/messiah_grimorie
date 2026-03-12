import Logger from '../../utils/Logger.js';

/**
 * 낚시 DOM 매니저 (Fishing DOM Manager)
 */
class FishingDOMManager {
    constructor() {
        Logger.system("FishingDOMManager: Initialized.");
    }

    ui_showFishingBar(progress) {
        Logger.info("UI_ROUTER", `Updating fishing mini-game bar: ${progress}`);
    }

    ui_openFishCollection() {
        Logger.info("UI_ROUTER", "Opening Fish Collection Archive UI.");
    }
}

const fishingDOMManager = new FishingDOMManager();
export default fishingDOMManager;
