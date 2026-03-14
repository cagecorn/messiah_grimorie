import Logger from '../../core/Logger.js';
import indexDBManager from '../../core/IndexDBManager.js';

/**
 * 인벤토리 DB 매니저 (Inventory DB Manager)
 * 역할: [인벤토리 데이터의 물리적 영속성 관리]
 * 
 * 설명: IndexedDB의 'inventory' 스토어와 직접 통신하여 
 * 아이템 리스트를 저장하고 불러옵니다.
 */
class InventoryDBManager {
    constructor() {
        this.storeName = 'inventory';
    }

    /**
     * 인벤토리 데이터 저장
     * @param {string} ownerId 'messiah' 또는 용병 ID
     * @param {Array} slots 아이템 인스턴스 배열
     */
    async saveInventory(ownerId, slots) {
        try {
            const data = {
                id: ownerId,
                slots: slots,
                updatedAt: Date.now()
            };
            await indexDBManager.save(this.storeName, data);
            Logger.info("DB_INVENTORY", `Inventory saved for ${ownerId}`);
        } catch (error) {
            Logger.error("DB_INVENTORY", `Failed to save inventory for ${ownerId}: ${error.message}`);
        }
    }

    /**
     * 인벤토리 데이터 로드
     * @param {string} ownerId 
     * @returns {Promise<Array|null>}
     */
    async loadInventory(ownerId) {
        try {
            const result = await indexDBManager.load(this.storeName, ownerId);
            if (result && result.slots) {
                Logger.info("DB_INVENTORY", `Inventory loaded for ${ownerId}`);
                return result.slots;
            }
            return null;
        } catch (error) {
            Logger.error("DB_INVENTORY", `Failed to load inventory for ${ownerId}: ${error.message}`);
            return null;
        }
    }
}

const inventoryDBManager = new InventoryDBManager();
export default inventoryDBManager;
