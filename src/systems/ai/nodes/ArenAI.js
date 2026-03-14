import MeleeAI from './MeleeAI.js';
import ChargeAttackAI from './ChargeAttackAI.js';
import ForMessiahAI from './ForMessiahAI.js';

/**
 * 아렌 전용 AI 노드 (Aren Specialized AI)
 * 역할: [아렌의 고유 스킬 및 궁극기 사용 로직 포함]
 */
class ArenAI {
    static execute(entity, bb, delta) {
        if (!entity.logic.isAlive) return;

        const opponents = (entity.team === 'mercenary') ? 
            entity.scene.enemies : entity.scene.allies;

        // 1. 궁극기 (For Messiah) 우선 체크
        if (ForMessiahAI.update(entity, opponents)) {
            bb.set('state', 'ultimate');
            return;
        }

        // 2. 고유 스킬 (Charge Attack) 체크
        if (ChargeAttackAI.update(entity, opponents)) {
            bb.set('state', 'skill');
            return;
        }

        // 3. 기본 근접 공격/이동 로직 수행
        MeleeAI.execute(entity, bb, delta);
    }
}

export default ArenAI;
