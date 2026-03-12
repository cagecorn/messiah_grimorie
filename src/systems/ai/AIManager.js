import Logger from '../../utils/Logger.js';
import blackboardManager from './BlackboardManager.js';

/**
 * AI 매니저 (AI Manager)
 * 역할: [모든 엔티티의 AI 로직 실행 및 루프 관리]
 */
class AIManager {
    constructor() {
        this.entities = new Set();
        this.strategies = new Map(); // { entityId: strategyInstance }
    }

    registerEntity(entity, strategy) {
        this.entities.add(entity);
        this.strategies.set(entity.id, strategy);
        
        // 블랙보드 초기화 (라우터 연동)
        blackboardManager.initForEntity(entity.id);
        
        Logger.system(`AI Registered: ${entity.name} with strategy ${strategy.constructor.name}`);
    }

    unregisterEntity(entityId) {
        this.entities.forEach(e => {
            if (e.id === entityId) this.entities.delete(e);
        });
        this.strategies.delete(entityId);
        blackboardManager.removeEntity(entityId);
    }

    /**
     * 메인 AI 루프 (프레임 단위 또는 일정 간격 업데이트)
     */
    update(deltaTime) {
        this.entities.forEach(entity => {
            const strategy = this.strategies.get(entity.id);
            if (strategy && entity.isAlive) {
                const aiBb = blackboardManager.get(entity.id, 'ai');
                const combatBb = blackboardManager.get(entity.id, 'combat');
                
                strategy.execute(entity, aiBb, combatBb, deltaTime);
            }
        });
    }
}

const aiManager = new AIManager();
export default aiManager;
