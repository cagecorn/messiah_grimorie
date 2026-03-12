import Logger from '../../utils/Logger.js';

/**
 * 연금술 DOM 매니저 (Alchemy DOM Manager)
 */
class AlchemyDOMManager {
    constructor() {
        Logger.system("AlchemyDOMManager: Initialized.");
    }

    ui_openLab() {
        Logger.info("UI_ROUTER", "Opening Alchemy Laboratory UI.");
    }

    ui_showTransmutationEffect() {
        Logger.info("UI_ROUTER", "Routing visual effect for transmutation.");
    }
}

const alchemyDOMManager = new AlchemyDOMManager();
export default alchemyDOMManager;
