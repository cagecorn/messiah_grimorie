import Phaser from 'phaser';
import { decideAquaBurstTarget } from '../../combat/skills/AquaBurstAI.js';

/**
 * 세이렌 AI 노드 (Siren AI Node)
 * 역할: [원거리 유지 + 아쿠아 버스트/수면 방울 스킬 위주 공격]
 */
class SirenAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Blackboard} bb 
     */
    static execute(entity, bb) {
        const enemies = (entity.team === 'mercenary') ? entity.scene.enemies : entity.scene.allies;

        // 1. 스킬 체크 (게이지 차면 실행)
        if (entity.skillProgress >= 1.0) {
            const skillTarget = decideAquaBurstTarget(entity);
            if (skillTarget) {
                const skillId = entity.skillData ? entity.skillData.id : 'aquaburst';
                entity.useSkill(skillId, skillTarget);
                entity.moveDirection = { x: 0, y: 0 };
                return;
            }
        }

        // 2. 거리 유지 및 평타 (RangedAI 로직 재용)
        const target = bb.get('target');
        if (!target) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, target.x, target.y);
        const stats = entity.logic.stats;
        
        const rangeMin = stats.get('rangeMin') || 150;
        const rangeMax = stats.get('rangeMax') || 400;

        let dx = 0;
        let dy = 0;

        if (dist < rangeMin) {
            const angle = Phaser.Math.Angle.Between(target.x, target.y, entity.x, entity.y);
            dx = Math.cos(angle);
            dy = Math.sin(angle);
        } else if (dist > rangeMax) {
            const angle = Phaser.Math.Angle.Between(entity.x, entity.y, target.x, target.y);
            dx = Math.cos(angle);
            dy = Math.sin(angle);
        } else {
            dx = 0;
            dy = 0;
            entity.attack(target);
        }

        entity.moveDirection = { x: dx, y: dy };
    }
}

export default SirenAI;
