import Logger from '../../../utils/Logger.js';
import SmiteAI from './SmiteAI.js';
import ultimateManager from '../../combat/UltimateManager.js';

/**
 * 분 궁극기 AI 노드 (Prove Your Existence AI)
 * 역할: [궁극기 게이지 충전 시 즉시 사용 결정]
 */
class ProveYourExistenceAI {
    /**
     * AI 로직 실행
     */
    static update(entity) {
        if (!entity || !entity.logic.isAlive) return false;

        // 1. 궁극기 준비 여부 체크
        if (!entity.isUltimateReady()) return false;

        const skillId = 'ProveYourExistence';
        const ultData = ultimateManager.getUltimateData(entity.logic.id);
        const skillLogic = ultData ? ultData.logic : null;
        
        if (!skillLogic) return false;

        const ownerId = entity.logic.id;
        const existingClone = skillLogic.activeClones.get(ownerId);

        // [결정 로직]
        if (existingClone && existingClone.active && existingClone.logic.isAlive) {
            // [상태 2] 스마이트 공격 - 적이 근처에 뭉쳐있을 때만 발동
            const targetPoint = SmiteAI.getBestTarget(entity);
            Logger.debug("BOON_AI", `Clone exists. Searching Smite target. Result: ${targetPoint ? `(${targetPoint.x}, ${targetPoint.y})` : 'NULL'}`);
            
            if (targetPoint) {
                if (entity.skills.useUltimate(targetPoint)) {
                    Logger.info("AI", `${entity.logic.name} cast Ultimate: SMITE!`);
                    return true;
                } else {
                    Logger.warn("BOON_AI", "useUltimate(targetPoint) failed internally.");
                }
            }
        } else {
            // [상태 1] 분신 소환 - 즉시 발동
            Logger.debug("BOON_AI", "No active clone. Attempting Summon.");
            if (entity.skills.useUltimate()) {
                Logger.info("AI", `${entity.logic.name} cast Ultimate: SUMMON CLONE!`);
                return true;
            }
        }

        return false;
    }
}

export default ProveYourExistenceAI;
