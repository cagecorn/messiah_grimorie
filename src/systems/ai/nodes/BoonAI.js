import MeleeAI from './MeleeAI.js';
import HolyAuraAI from './HolyAuraAI.js';
import ProveYourExistenceAI from './ProveYourExistenceAI.js';

/**
 * 성기사 분 전용 AI (Boon AI)
 * 역할: [근접 전투 수행 및 홀리 오라 상시 유지]
 */
class BoonAI {
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        // 1. 궁극기 체크
        if (ProveYourExistenceAI.update(entity)) return;
 
        // 2. 오라 체크 (상시 유지)
        if (HolyAuraAI.update(entity)) return;

        // 3. 기본 근접 행동 로직 수행 (근접 공격 및 추격)
        MeleeAI.execute(entity, bb, delta);
    }
}

export default BoonAI;
