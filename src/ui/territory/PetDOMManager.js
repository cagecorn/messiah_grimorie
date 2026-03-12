import Logger from '../../utils/Logger.js';

/**
 * 펫 DOM 매니저 (Pet DOM Manager)
 */
class PetDOMManager {
    constructor() {
        Logger.system("PetDOMManager: Initialized.");
    }

    ui_openPetMenu() {
        Logger.info("UI_ROUTER", "Opening Pet Management UI.");
    }

    ui_updatePetStats(petData) {
        Logger.info("UI_ROUTER", "Updating pet visual stats.");
    }
}

const petDOMManager = new PetDOMManager();
export default petDOMManager;
