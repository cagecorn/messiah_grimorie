import WizardAI from './WizardAI.js';
import SkillFireballAI from './SkillFireballAI.js';
import MeteorStrikeAI from './MeteorStrikeAI.js';

/**
 * 멀린 전용 AI 노드 (Merlin Specialized AI)
 * 역할: [멀린의 고유 스킬(파이어볼) 및 궁극기(메테오 스트라이크) 사용 로직 포함]
 */
class MerlinAI {
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        const enemies = (entity.team === 'mercenary') ? entity.scene.enemies : entity.scene.allies;

        // 1. 궁극기 (Meteor Strike) 체크
        if (MeteorStrikeAI.update(entity)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 2. 고유 스킬 (Fireball) 체크
        if (SkillFireballAI.tick(entity, enemies)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 3. 기본 위자드 행동 로직 수행
        WizardAI.execute(entity, bb, delta);
    }
}

export default MerlinAI;
