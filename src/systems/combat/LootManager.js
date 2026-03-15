import itemPoolingManager from './ItemPoolingManager.js';
import lootInteractionManager from './LootInteractionManager.js';
import lootTableManager from './LootTableManager.js';
import Logger from '../../utils/Logger.js';
import EventBus, { EVENTS } from '../../core/EventBus.js';

/**
 * 루트 매니저 (Loot Manager)
 * 역할: [보상의 시각화 및 물리적 수집 준비]
 */
class LootManager {
    constructor() {
        this.scene = null;
        this.isInitialized = false;
    }

    init(scene) {
        this.scene = scene;
        
        // [SCENE-SPECIFIC] 씬이 바뀔 때마다 하위 매니저들에게 새로운 씬 객체를 전달하여 동기화
        itemPoolingManager.init(scene);
        lootInteractionManager.init(scene, itemPoolingManager.getLootGroup());

        if (this.isInitialized) {
            Logger.system("LootManager: Re-linked to new scene instance.");
            return;
        }

        // [GLOBAL] 한 번만 등록해야 하는 이벤트 리스너들
        EventBus.on(EVENTS.ENTITY_DIED, (entity) => this.handleEntityDeath(entity));
        
        this.isInitialized = true;
        Logger.system("LootManager: Persistent loot system active.");
    }

    /**
     * 몬스터 사망 시 드랍 정산 및 연출
     */
    handleEntityDeath(entity) {
        if (entity.team === 'mercenary' || entity.team === 'summon') return;

        const dropTableId = entity.logic.dropTableId;
        const monsterLevel = entity.leveling ? entity.leveling.getLevel() : 1;
        
        // 1. 보상 확정 (데이터 기반)
        const loot = lootTableManager.roll(dropTableId, monsterLevel);

        // 2. 골드 드랍 연출 (물리적 드랍)
        if (loot.gold > 0) {
            this.spawnGoldLoot(entity.x, entity.y, loot.gold);
        }

        // 3. 아이템 드랍 연출 (물리적 드랍 - 이제 LootInteractionManager에서 수집 담당)
        if (loot.items && loot.items.length > 0) {
            loot.items.forEach(itemId => {
                itemPoolingManager.spawnItem(entity.x, entity.y, itemId);
            });
        }
    }

    /**
     * 전장에 골드 동전 생성
     */
    spawnGoldLoot(x, y, amount) {
        if (!this.scene) return;

        // 시각적 연출: 여러 개의 동전을 사방으로 튕김
        const coinCount = Math.min(8, Math.ceil(amount / 5)); // 최대 8개

        for (let i = 0; i < coinCount; i++) {
            // [FIX] 정수 단위로 골드 분배하여 소수점 버그 방지
            const isLast = (i === coinCount - 1);
            const coinAmount = isLast ? 
                (amount - Math.floor(amount / coinCount) * (coinCount - 1)) : 
                Math.floor(amount / coinCount);

            this.scene.time.delayedCall(i * 30, () => {
                itemPoolingManager.spawnGold(x, y, coinAmount);
            });
        }
        
        Logger.info("LOOT", `Dropped ${amount} gold as ${coinCount} coins.`);
    }
}

const lootManager = new LootManager();
export default lootManager;
