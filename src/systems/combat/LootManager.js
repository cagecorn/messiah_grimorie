import Logger from '../../utils/Logger.js';
import EventBus, { EVENTS } from '../../core/EventBus.js';
import lootTableManager from './LootTableManager.js';
import itemPoolingManager from './ItemPoolingManager.js';

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
        if (this.isInitialized) return;

        // 아이템 풀링 매니저 초기화
        itemPoolingManager.init(scene);

        // 사망 이벤트 구독
        EventBus.on(EVENTS.ENTITY_DIED, (entity) => this.handleEntityDeath(entity));
        
        this.isInitialized = true;
        Logger.system("LootManager: Persistent loot system active.");
    }

    /**
     * 몬스터 사망 시 드랍 정산 및 연출
     */
    handleEntityDeath(entity) {
        if (entity.team === 'mercenary' || entity.team === 'summon') return;

        const monsterId = entity.logic.id;
        const monsterLevel = entity.leveling ? entity.leveling.getLevel() : 1;
        
        // 1. 보상 확정 (데이터 기반)
        const loot = lootTableManager.roll(monsterId, monsterLevel);

        // 2. 골드 드랍 연출 (물리적 드랍)
        if (loot.gold > 0) {
            this.spawnGoldLoot(entity.x, entity.y, loot.gold);
        }

        // 3. 아이템 드랍 연출
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
            this.scene.time.delayedCall(i * 30, () => {
                itemPoolingManager.spawnGold(x, y, amount / coinCount);
            });
        }
        
        Logger.info("LOOT", `Dropped ${amount} gold as ${coinCount} coins.`);
    }
}

const lootManager = new LootManager();
export default lootManager;
