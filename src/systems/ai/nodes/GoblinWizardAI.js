import WizardAI from './WizardAI.js';
import FireBurstAI from '../../combat/skills/FireBurstAI.js';

/**
 * 고블린 위자드 전용 AI 노드 (Goblin Wizard Specialized AI)
 * 역할: [파이어 버스트 스킬을 우선적으로 사용하며 위자드 행동 패턴을 따름]
 */
class GoblinWizardAI {
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        const enemies = (entity.team === 'mercenary') ? entity.scene.enemies : entity.scene.allies;

        // 1. 고유 스킬 (Fire Burst) 체크 및 사용 결정
        const skill = entity.skills ? entity.skills.getSkill('fire_burst') : null;
        if (skill && entity.skills.isReady('fire_burst')) {
            // FireBurstAI의 타겟 결정을 활용하여 시전
            const target = FireBurstAI.decideFireBurstTarget(entity);
            if (target) {
                entity.skills.useSkill('fire_burst', target);
                entity.moveDirection = { x: 0, y: 0 };
                return;
            }
        }

        // 2. 기본 위자드 행동 로직 수행 (카이팅 및 일반 마법 공격)
        WizardAI.execute(entity, bb, delta);
    }
}

export default GoblinWizardAI;
