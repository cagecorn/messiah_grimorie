import Logger from '../../utils/Logger.js';
import entityManager from '../../core/EntityManager.js';

/**
 * 아이템 획득 인터랙션 매니저 (Loot Interaction Manager)
 * 역할: [아이템 수집의 물리적 판단]
 * 
 * 설명: 
 * 1. 유닛(용병, 소환수)이 아이템에 닿으면 획득 (Overlap)
 * 2. 아이템 오브젝트 자체 클릭 시 획득 (LootEntity 내부 처리)
 */
class LootInteractionManager {
    constructor() {
        this.scene = null;
        this.lootGroup = null;
        this.isInitialized = false;
    }

    /**
     * 초기화
     */
    init(scene, lootGroup) {
        this.scene = scene;
        this.lootGroup = lootGroup;
        this.isInitialized = true;
        
        Logger.system("LootInteractionManager: Collection collision system active.");
    }

    /**
     * 유닛(용병, 소환수)과의 자동 획득 판단 (Overlap)
     */
    update() {
        if (!this.isInitialized || !this.lootGroup || !this.scene?.physics) return;

        // [STABLE] 등록된 용병들을 수집가로 활용
        const collectors = Array.from(entityManager.getCategory('mercenary'));
        
        // 살아있고 액티브한 용병만 필터링 (물리 충돌 최적화)
        const activeCollectors = collectors.filter(c => c.active && c.logic?.isAlive);
        if (activeCollectors.length === 0) return;

        // [STABLE] 물리 중첩 확인 (Overlap)
        this.scene.physics.overlap(
            activeCollectors,
            this.lootGroup,
            (collector, loot) => {
                if (loot && loot.active && !loot.isCollected) {
                    loot.collect();
                }
            }
        );
    }
}

const lootInteractionManager = new LootInteractionManager();
export default lootInteractionManager;
