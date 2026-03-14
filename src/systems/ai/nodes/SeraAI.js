import HealerAI from './HealerAI.js';
import MassHealAI from './MassHealAI.js';
import SummonGuardianAngelAI from './SummonGuardianAngelAI.js';

/**
 * 세라 전용 AI 노드 (Sera Specialized AI)
 * 역할: [세라의 고유 스킬(매스 힐) 및 궁극기(수호천사 소환) 사용 로직 포함]
 */
class SeraAI {
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        const Allies = (entity.team === 'mercenary') ? entity.scene.allies : entity.scene.enemies;

        // 1. 궁극기 (Summon Guardian Angel) 체크
        if (SummonGuardianAngelAI.update(entity, Allies)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 2. 고유 스킬 (Mass Heal) 체크
        if (MassHealAI.execute(entity, bb)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 3. 기본 힐러 행동 로직 수행
        HealerAI.execute(entity, bb, delta);
    }
}

export default SeraAI;
