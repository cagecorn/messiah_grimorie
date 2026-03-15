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
        
        // [COMPAT] 기존의 파편화된 아이템들(로그 등)을 하나로 합침
        await this.compactInventory('messiah');
        
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

        // [STABLE] 중첩 가능 아이템(Stackable) 로직
        // MATERIAL 타입 등은 기존 슬롯을 먼저 찾아 합칩니다.
        const Registry = (await import('./Registry.js')).default;
        const emojiManager = (await import('./EmojiManager.js')).default;
        
        // [COMPAT] ID 정규화 (이모지 -> 표준 ID)
        itemInstance.id = emojiManager.normalizeToId(itemInstance.id);

        const itemDef = Registry.items.get(itemInstance.id);
        const isStackable = itemDef && (itemDef.type === 'MATERIAL' || itemDef.type === 'CURRENCY');

        if (isStackable) {
            // [COMPAT] 기존 슬롯 찾을 때도 정규화하여 비교
            const existingSlotIdx = inv.slots.findIndex(slot => {
                if (!slot) return false;
                const normalizedSlotId = emojiManager.normalizeToId(slot.id);
                return normalizedSlotId === itemInstance.id;
            });
            if (existingSlotIdx !== -1) {
                inv.slots[existingSlotIdx].amount += itemInstance.amount;
                await inventoryDBManager.saveInventory(ownerId, inv.slots);
                
                Logger.info("INVENTORY_ROUTER", `Item stacked for ${ownerId}: ${itemInstance.id} (New amount: ${inv.slots[existingSlotIdx].amount})`);
                EventBus.emit('INVENTORY_UPDATED', { ownerId, slots: inv.slots });
                return true;
            }
        }
        
        // 빈 슬롯 찾기
        const emptySlot = inv.slots.findIndex(slot => slot === null);
        if (emptySlot !== -1) {
            inv.slots[emptySlot] = itemInstance;
            
            // 물리적 저장 라우팅
            await inventoryDBManager.saveInventory(ownerId, inv.slots);
            
            Logger.info("INVENTORY_ROUTER", `Item added to new slot for ${ownerId}: ${itemInstance.id}`);
            EventBus.emit('INVENTORY_UPDATED', { ownerId, slots: inv.slots });
            return true;
        }

        Logger.warn("INVENTORY_ROUTER", `Inventory full for ${ownerId}`);
        return false;
    }

    /**
     * 인벤토리 압축 (Defragmentation)
     * 파편화된 동일 아이템들을 하나로 합칩니다.
     */
    async compactInventory(ownerId) {
        const inv = this.inventories.get(ownerId);
        if (!inv) return;

        const Registry = (await import('./Registry.js')).default;
        const emojiManager = (await import('./EmojiManager.js')).default;

        Logger.info("INVENTORY_ROUTER", `Compacting inventory for ${ownerId}...`);

        const newSlots = new Array(inv.capacity).fill(null);
        let currentSlotIdx = 0;

        // 아이템별로 정리된 Map (ID -> mergedInstance)
        const bucket = new Map();

        for (const slot of inv.slots) {
            if (!slot) continue;

            const normalizedId = emojiManager.normalizeToId(slot.id);
            const itemDef = Registry.items.get(normalizedId);
            const isStackable = itemDef && (itemDef.type === 'MATERIAL' || itemDef.type === 'CURRENCY');

            if (isStackable) {
                if (bucket.has(normalizedId)) {
                    bucket.get(normalizedId).amount += slot.amount;
                } else {
                    // 복사본 생성하여 정규화된 ID로 변경
                    bucket.set(normalizedId, { ...slot, id: normalizedId });
                }
            } else {
                // 중첩 불가능한 건 그대로 새 슬롯에 예약
                if (currentSlotIdx < inv.capacity) {
                    newSlots[currentSlotIdx++] = slot;
                }
            }
        }

        // 중첩된 아이템들을 새 슬롯에 배치
        for (const mergedItem of bucket.values()) {
            if (currentSlotIdx < inv.capacity) {
                newSlots[currentSlotIdx++] = mergedItem;
            }
        }

        // 상태 업데이트 및 저장
        inv.slots = newSlots;
        await inventoryDBManager.saveInventory(ownerId, inv.slots);
        
        Logger.info("INVENTORY_ROUTER", `Compaction complete for ${ownerId}.`);
        EventBus.emit('INVENTORY_UPDATED', { ownerId, slots: inv.slots });
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
