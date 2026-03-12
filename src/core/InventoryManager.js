import Logger from '../utils/Logger.js';
import EventBus, { EVENTS } from './EventBus.js';

/**
 * 인벤토리 매니저 (Inventory Manager)
 * 역할: [라우터 (Router) & 소지품 논리 제어기]
 * 
 * 설명: 플레이어나 용병의 인벤토리 공간과 아이템의 이동, 획득, 소모를 총괄하는 라우터입니다.
 * 시각적인 그리드(DOMGridManager)와 실제 데이터 사이의 가교 역할을 합니다.
 */
class InventoryManager {
    constructor() {
        this.inventories = new Map();
        Logger.system("InventoryManager Router: Initialized (Possession logic hub ready).");
    }

    /**
     * 특정 주체의 인벤토리 초기화
     */
    initInventory(ownerId, capacity = 20) {
        const inv = {
            ownerId,
            capacity,
            slots: new Array(capacity).fill(null)
        };
        this.inventories.set(ownerId, inv);
        Logger.info("INVENTORY_ROUTER", `Inventory initialized for ${ownerId} (Size: ${capacity})`);
    }

    /**
     * 아이템 획득 라우팅
     */
    addItem(ownerId, itemInstance) {
        const inv = this.inventories.get(ownerId);
        if (!inv) return false;

        // 빈 슬롯 찾기
        const emptySlot = inv.slots.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            inv.slots[emptySlot] = itemInstance;
            Logger.info("INVENTORY_ROUTER", `Item added to ${ownerId}: ${itemInstance.id}`);
            EventBus.emit('INVENTORY_UPDATED', { ownerId, slots: inv.slots });
            return true;
        }

        Logger.warn("INVENTORY_ROUTER", `Inventory full for ${ownerId}`);
        return false;
    }

    /**
     * 슬롯 간 아이템 이동(Swap) 라우팅
     */
    swapSlots(ownerId, fromIdx, toIdx) {
        const inv = this.inventories.get(ownerId);
        if (!inv) return;

        const temp = inv.slots[fromIdx];
        inv.slots[fromIdx] = inv.slots[toIdx];
        inv.slots[toIdx] = temp;

        Logger.info("INVENTORY_ROUTER", `Swapped slots ${fromIdx} <-> ${toIdx} for ${ownerId}`);
        EventBus.emit('INVENTORY_UPDATED', { ownerId, slots: inv.slots });
    }

    /**
     * 특정 소유자의 인벤토리 데이터 반환
     */
    getSlots(ownerId) {
        const inv = this.inventories.get(ownerId);
        return inv ? inv.slots : [];
    }
}

const inventoryManager = new InventoryManager();
export default inventoryManager;
