import Logger from '../../utils/Logger.js';
import EventBus from '../../core/EventBus.js';
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
     * 이 함수는 BattleScene이나 전담 매니저의 update 루틴에서 호출됩니다.
     */
    update() {
        if (!this.isInitialized || !this.lootGroup) return;

        const collectors = entityManager.getEntitiesByTeams(['mercenary', 'summon']);
        if (collectors.length === 0) return;

        // [STABLE] 물리 중첩 확인 (Overlap)
        this.scene.physics.overlap(
            collectors,
            this.lootGroup,
            (collector, loot) => {
                if (loot.active && !loot.isCollected) {
                    loot.collect();
                }
            }
        );
    }
}

const lootInteractionManager = new LootInteractionManager();
export default lootInteractionManager;
