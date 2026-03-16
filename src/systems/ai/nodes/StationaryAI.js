import Phaser from 'phaser';

/**
 * Stationary AI 노드 (Stationary AI Node)
 * 역할: [움직이지 않고 제자리에서 공격만 수행]
 * 
 * 설명:
 * 1. 이동(moveDirection)을 항상 {x: 0, y: 0}으로 유지합니다.
 * 2. 사거리 내에 타겟이 있으면 공격을 시도합니다.
 */
class StationaryAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Blackboard} bb 
     */
    static execute(entity, bb) {
        entity.moveDirection = { x: 0, y: 0 };

        const target = bb.get('target');
        if (!target) return;

        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, target.x, target.y);
        const stats = entity.logic.stats;
        const rangeMax = stats.get('rangeMax') || 400;

        if (dist <= rangeMax) {
            entity.attack(target);
        }
    }
}

export default StationaryAI;
