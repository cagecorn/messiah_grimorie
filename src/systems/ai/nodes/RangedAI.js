import Phaser from 'phaser';
import KnockbackShotAI from './KnockbackShotAI.js';

/**
 * 원거리 AI 노드 (Ranged AI Node)
 * 역할: [적과 일정한 사거리를 유지하며 카이팅(Kiting) 수행]
 * 
 * 설명:
 * 1. 거리가 너무 멀면 다가감.
 * 2. 사거리 내에 있으면 멈추고 공격.
 * 3. 적이 너무 가까워지면(최소 사거리 미만) 뒤로 물러남.
 */
class RangedAI {
    /**
     * @param {CombatEntity} entity AI 주체
     * @param {Blackboard} bb 데이터 저장소
     */
    static execute(entity, bb) {
        // [신규] 스킬 사용 시도 (넉백 샷 - 적 클러스터 타겟팅)
        const allies = entity.scene.allies;
        const enemies = (entity.team === 'mercenary') ? entity.scene.enemies : entity.scene.allies;
        
        if (KnockbackShotAI.tick(entity, allies, enemies)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        const target = bb.get('target');
        if (!target) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, target.x, target.y);
        const stats = entity.logic.stats;
        
        const rangeMin = stats.get('rangeMin') || 100;
        const rangeMax = stats.get('rangeMax') || 350;

        let dx = 0;
        let dy = 0;

        if (dist < rangeMin) {
            // 1. 카이팅: 너무 가까우면 뒤로 물러남
            const angle = Phaser.Math.Angle.Between(target.x, target.y, entity.x, entity.y);
            dx = Math.cos(angle);
            dy = Math.sin(angle);
        } else if (dist > rangeMax) {
            // 2. 접근: 너무 멀면 다가감
            const angle = Phaser.Math.Angle.Between(entity.x, entity.y, target.x, target.y);
            dx = Math.cos(angle);
            dy = Math.sin(angle);
        } else {
            // 3. 사거리 내 적절한 위치: 정지 및 공격
            dx = 0;
            dy = 0;
            entity.attack(target);
        }

        entity.moveDirection = { x: dx, y: dy };
    }
}

export default RangedAI;
