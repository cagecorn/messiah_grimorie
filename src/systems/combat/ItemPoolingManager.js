import poolingManager from '../../core/PoolingManager.js';
import LootEntity from '../../entities/LootEntity.js';
import emojiManager from '../../core/EmojiManager.js';

/**
 * 아이템 풀링 매니저 (Item Pooling Manager)
 * 역할: [전리품 개체(LootEntity)의 효율적인 관리]
 */
class ItemPoolingManager {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        
        // 골드용 풀 등록 (EmojiManager에서 키 가져옴)
        const goldKey = emojiManager.getAssetKey('🪙');
        poolingManager.registerPool('loot_gold', () => {
            const entity = new LootEntity(scene, 0, 0, goldKey);
            entity.poolType = 'loot_gold';
            return entity;
        }, 30); // 대규모 드랍 대비 초기 사이즈 30

        // 기본 아이템 풀 등록 (나중에 아이템 아이콘별로 확장 가능)
        poolingManager.registerPool('loot_item', () => {
            const entity = new LootEntity(scene, 0, 0, 'emoji_shield'); // 임시 텍스처
            entity.poolType = 'loot_item';
            return entity;
        }, 10);
    }

    /**
     * 인터랙션 매니저를 위한 그룹 반환
     */
    getLootGroup() {
        // PoolingManager에 의해 내부적으로 관리되는 물리 그룹이 있다면 그것을 반환하거나,
        // 여기서는 PoolingManager.getGroup() 등을 활용 (구현에 따라 다름)
        // [STABLE] PoolingManager가 내부적으로 그룹을 관리하므로 해당 그룹을 가져옵니다.
        return poolingManager.getGroup('loot_gold'); // 아이템과 골드 물리 그룹이 분리되어 있다면 둘 다 체크 필요
    }

    /**
     * 골드 드랍 개체 생성
     */
    spawnGold(x, y, amount) {
        const coin = poolingManager.get('loot_gold');
        if (coin) {
            coin.init(x, y, {
                amount: amount,
                lootType: 'gold',
                scale: 0.35
            });
            return coin;
        }
        return null;
    }

    /**
     * 아이템 드랍 개체 생성
     */
    spawnItem(x, y, itemId) {
        const item = poolingManager.get('loot_item');
        if (item) {
            item.init(x, y, {
                itemId: itemId,
                lootType: 'item',
                scale: 0.4
            });
            // 아이템 텍스처 업데이트 로직 추가 가능
            return item;
        }
        return null;
    }
}

const itemPoolingManager = new ItemPoolingManager();
export default itemPoolingManager;
