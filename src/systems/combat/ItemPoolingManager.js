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
        
        // [SCENE-SPECIFIC] 물리 중첩 기능을 위해 통합 루팅 그룹 생성 
        // 씬이 바뀔 때마다 기존 그룹은 파괴되므로 항상 새로 생성함
        this.lootGroup = scene.physics.add.group();

        // [STABLE] 이미 등록된 풀(Pool)은 PoolingManager 내부에서 관리되므로,
        // 팩토리 함수만 최신 씬을 참조하도록 갱신하거나 필요한 경우 재등록합니다.
        
        // 골드용 풀 등록 (EmojiManager에서 키 가져옴)
        const goldKey = emojiManager.getAssetKey('🪙');
        poolingManager.registerPool('loot_gold', () => {
            const entity = new LootEntity(this.scene, 0, 0, goldKey);
            entity.poolType = 'loot_gold';
            this.lootGroup.add(entity); // 새 그룹에 포함
            return entity;
        }, 30, true); // Overwrite: true 를 지원하도록 PoolingManager 수정 고려 (현재는 덮어씌움)

        // 기본 아이템 풀 등록
        poolingManager.registerPool('loot_item', () => {
            const entity = new LootEntity(this.scene, 0, 0, 'emoji_shield'); 
            entity.poolType = 'loot_item';
            this.lootGroup.add(entity); // 새 그룹에 포함
            return entity;
        }, 10, true);
    }

    /**
     * 인터랙션 매니저를 위한 그룹 반환
     */
    getLootGroup() {
        return this.lootGroup;
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
