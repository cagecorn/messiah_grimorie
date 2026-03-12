import Logger from '../utils/Logger.js';

/**
 * 장비 매니저 (Equipment Manager)
 * 역할: [라우터 & 장착 상태 관리자]
 */
class EquipmentManager {
    constructor() {
        Logger.system("EquipmentManager: Initialized (Armory hub ready).");
    }

    /**
     * 장비 장착 라우팅
     */
    equip(unit, item) {
        Logger.info("EQUIP_ROUTER", `Routing equip: ${item.id} to ${unit.id}`);
    }

    /**
     * 장비 강화/세공 요청 라우팅
     */
    requestUpgrade(item) {
        Logger.info("EQUIP_ROUTER", `Routing upgrade request for ${item.id}`);
    }
}

const equipmentManager = new EquipmentManager();
export default equipmentManager;
