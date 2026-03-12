import Logger from '../../utils/Logger.js';

/**
 * 채광 DOM 매니저 (Mining DOM Manager)
 */
class MiningDOMManager {
    constructor() {
        Logger.system("MiningDOMManager: Initialized.");
    }

    ui_showMiningOverlay() {
        Logger.info("UI_ROUTER", "Displaying mining node interaction UI.");
    }
}

const miningDOMManager = new MiningDOMManager();
export default miningDOMManager;
