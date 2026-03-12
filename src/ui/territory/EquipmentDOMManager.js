import Logger from '../../utils/Logger.js';

/**
 * 장비 DOM 매니저 (Equipment DOM Manager)
 */
class EquipmentDOMManager {
    constructor() {
        Logger.system("EquipmentDOMManager: Initialized.");
    }

    ui_showDetails(itemData) {
        Logger.info("UI_ROUTER", `Displaying equipment details for: ${itemData.id}`);
    }

    ui_renderEquippedSlots(unitData) {
        Logger.info("UI_ROUTER", "Rendering equipment slots for unit.");
    }
}

const equipmentDOMManager = new EquipmentDOMManager();
export default equipmentDOMManager;
