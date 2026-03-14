import Phaser from 'phaser';

/**
 * 위자드 AI 노드 (Wizard AI Node)
 * 역할: [원거리 유지 + 메테오 및 파이어볼 스킬 위주 광폭 공격]
 * 
 * 설명:
 * 1. 궁극기(메테오 스트라이크) 가능 시 즉시 실행.
 * 2. 스킬(파이어볼) 가능 시 타겟 지역에 발사.
 * 3. 기본적으로는 RangedAI와 유사하게 거리 유지하며 평타.
 */
class WizardAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Blackboard} bb 
     */
    static execute(entity, bb) {
        // 3. 거리 유지 및 평타 (RangedAI 로직 재용)
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
            // 너무 가까우면 뒤로
            const angle = Phaser.Math.Angle.Between(target.x, target.y, entity.x, entity.y);
            dx = Math.cos(angle);
            dy = Math.sin(angle);
        } else if (dist > rangeMax) {
            // 너무 멀면 앞으로
            const angle = Phaser.Math.Angle.Between(entity.x, entity.y, target.x, target.y);
            dx = Math.cos(angle);
            dy = Math.sin(angle);
        } else {
            // 사거리 내: 정지 및 공격
            dx = 0;
            dy = 0;
            entity.attack(target);
        }

        entity.moveDirection = { x: dx, y: dy };
    }
}

export default WizardAI;
