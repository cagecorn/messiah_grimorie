import Logger from '../utils/Logger.js';
import EventBus, { EVENTS } from './EventBus.js';
import inventoryDBManager from '../systems/persistence/InventoryDBManager.js';

/**
 * 인벤토리 매니저 (Inventory Manager)
 * 역할: [라우터 (Router) & 소지품 논리 제어기]
 */
class InventoryManager {
    constructor() {
        this.inventories = new Map();
        this.isInitialized = false;
    }

    /**
     * 시스템 초기화 및 데이터 로드 라우팅
     */
    async initialize() {
        if (this.isInitialized) return;
        
        // 메시아(유저) 인벤토리 기본 로드
        await this.loadInventory('messiah');
        
        this.isInitialized = true;
        Logger.system("InventoryManager Router: System linked and data loaded.");
    }

    /**
     * 특정 주체의 인벤토리 로드 및 초기화
     */
    async loadInventory(ownerId, capacity = 20) {
        const savedSlots = await inventoryDBManager.loadInventory(ownerId);
        
        const inv = {
            ownerId,
            capacity,
            slots: savedSlots || new Array(capacity).fill(null)
        };
        
        this.inventories.set(ownerId, inv);
        Logger.info("INVENTORY_ROUTER", `Inventory loaded/initialized for ${ownerId}`);
        return inv;
    }

    /**
     * 아이템 획득 라우팅
     */
    async addItem(ownerId, itemInstance) {
        const inv = this.inventories.get(ownerId);
        if (!inv) return false;

        // [TODO] 중첩 가능 아이템(Stackable) 로직 추가 예정
        
        const emptySlot = inv.slots.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            inv.slots[emptySlot] = itemInstance;
            
            // 물리적 저장 라우팅
            await inventoryDBManager.saveInventory(ownerId, inv.slots);
            
            Logger.info("INVENTORY_ROUTER", `Item added and saved for ${ownerId}: ${itemInstance.id}`);
            EventBus.emit('INVENTORY_UPDATED', { ownerId, slots: inv.slots });
            return true;
        }

        Logger.warn("INVENTORY_ROUTER", `Inventory full for ${ownerId}`);
        return false;
    }

    /**
     * 슬롯 간 아이템 이동(Swap) 및 저장 라우팅
     */
    async swapSlots(ownerId, fromIdx, toIdx) {
        const inv = this.inventories.get(ownerId);
        if (!inv) return;

        const temp = inv.slots[fromIdx];
        inv.slots[fromIdx] = inv.slots[toIdx];
        inv.slots[toIdx] = temp;

        await inventoryDBManager.saveInventory(ownerId, inv.slots);
        
        Logger.info("INVENTORY_ROUTER", `Swapped and saved slots for ${ownerId}`);
        EventBus.emit('INVENTORY_UPDATED', { ownerId, slots: inv.slots });
    }

    getSlots(ownerId) {
        const inv = this.inventories.get(ownerId);
        return inv ? inv.slots : [];
    }
}

const inventoryManager = new InventoryManager();
export default inventoryManager;
