import Phaser from 'phaser';

/**
 * 플라잉맨 AI 노드 (FlyingMan AI Node)
 * 역할: [비행 상태를 유지하며 원거리 공격 수행]
 * 
 * 특징:
 * 1. RangedAI와 유사하게 카이팅 수행.
 * 2. 논타겟 투사체에 면역이므로 투사체 감지/회피 로직이 필요 없음 (AIManager/ActionSelector에서 제어).
 */
class FlyingManAI {
    /**
     * @param {CombatEntity} entity AI 주체
     * @param {Blackboard} bb 데이터 저장소
     */
    static execute(entity, bb) {
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

export default FlyingManAI;
