import Logger from '../utils/Logger.js';
import inventoryManager from '../core/InventoryManager.js';
import EventBus from '../core/EventBus.js';

/**
 * 메시아 인벤토리 매니저 (Messiah Inventory Manager)
 * 역할: [메시아(유저) 개인 소지품 논리 처리]
 */
class MessiahInventoryManager {
    constructor() {
        this.ownerId = 'messiah';
    }

    /**
     * 아이템 획득 (라우터 호출)
     */
    async acquireItem(itemId, amount = 1) {
        // [TODO] 향후 ItemInstance 클래스 구성 시 보강
        const itemInstance = {
            id: itemId,
            amount: amount,
            acquiredAt: Date.now()
        };
        
        const success = await inventoryManager.addItem(this.ownerId, itemInstance);
        if (success) {
            Logger.info("MESSIAH_INV", `Acquired item: ${itemId} x${amount}`);
        }
        return success;
    }

    /**
     * 특정 슬롯의 아이템 가져오기
     */
    getSlots() {
        return inventoryManager.getSlots(this.ownerId);
    }
}

const messiahInventoryManager = new MessiahInventoryManager();
export default messiahInventoryManager;
