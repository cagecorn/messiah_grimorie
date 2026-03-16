import Phaser from 'phaser';

/**
 * 토템술사 AI (Totemist AI)
 * 역할: [적과 거리를 유지하며 토템을 설치하여 공격함]
 */
class TotemistAI {
    static execute(entity, bb, delta) {
        const target = bb.get('target');
        if (!target) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, target.x, target.y);
        const rangeMin = entity.logic.stats.get('rangeMin') || 200;
        const rangeMax = entity.logic.stats.get('rangeMax') || 400;

        let dx = 0;
        let dy = 0;

        if (dist < rangeMin) {
            // 퇴각
            const angle = Phaser.Math.Angle.Between(target.x, target.y, entity.x, entity.y);
            dx = Math.cos(angle);
            dy = Math.sin(angle);
        } else if (dist > rangeMax) {
            // 접근
            const angle = Phaser.Math.Angle.Between(entity.x, entity.y, target.x, target.y);
            dx = Math.cos(angle);
            dy = Math.sin(angle);
        } else {
            // 사거리 내: 공격(토템 설치) 시도
            dx = 0;
            dy = 0;
            entity.attack(target);
        }

        entity.moveDirection = { x: dx, y: dy };
    }
}

export default TotemistAI;
