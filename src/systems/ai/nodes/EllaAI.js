import RangedAI from './RangedAI.js';
import KnockbackShotAI from './KnockbackShotAI.js';
import ThreadsOfFateAI from './ThreadsOfFateAI.js';

/**
 * 엘라 전용 AI 노드 (Ella Specialized AI)
 * 역할: [엘라의 고유 스킬(넉백 샷) 및 궁극기(운명의 실타래) 사용 로직 포함]
 */
class EllaAI {
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        const enemies = (entity.team === 'mercenary') ? entity.scene.enemies : entity.scene.allies;
        const allies = entity.scene.allies;
        
        // 1. 궁극기 (Threads of Fate) 체크
        if (ThreadsOfFateAI.update(entity, enemies)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 2. 고유 스킬 (Knockback Shot) 체크
        if (KnockbackShotAI.tick(entity, allies, enemies)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 3. 기본 원거리 행동 로직 수행
        RangedAI.execute(entity, bb, delta);
    }
}

export default EllaAI;
