import { AIBlackboard, CombatBlackboard } from './blackboards/BlackboardDefinitions.js';
import Logger from '../../utils/Logger.js';

/**
 * 블랙보드 매니저 (Blackboard Manager)
 * 역할: [엔티티별 블랙보드 인스턴스 관리 및 라우팅]
 */
class BlackboardManager {
    constructor() {
        this.entityBlackboards = new Map(); // { entityId: { ai, combat } }
    }

    /**
     * 엔티티를 위한 블랙보드 세트 초기화
     */
    initForEntity(entityId) {
        if (this.entityBlackboards.has(entityId)) return;

        this.entityBlackboards.set(entityId, {
            ai: new AIBlackboard(),
            combat: new CombatBlackboard()
        });

        Logger.system(`Blackboard initialized for Entity: ${entityId}`);
    }

    /**
     * 특정 엔티티의 블랙보드 가져오기
     */
    get(entityId, type = 'ai') {
        const set = this.entityBlackboards.get(entityId);
        return set ? set[type] : null;
    }

    removeEntity(entityId) {
        this.entityBlackboards.delete(entityId);
    }
}

const blackboardManager = new BlackboardManager();
export default blackboardManager;
