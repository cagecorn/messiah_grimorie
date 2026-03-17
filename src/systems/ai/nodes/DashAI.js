import Phaser from 'phaser';

/**
 * 대쉬 AI 노드 (Dash AI Node)
 * 역할: [적이 근접했을 때 반대 방향으로 빠르게 회피]
 */
class DashAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Array<CombatEntity>} enemies 
     */
    static tick(entity, enemies) {
        if (!entity || !entity.active || entity.isDashing()) return false;

        // 1. 스태미나 체크 (30 소모)
        if (!entity.stamina || entity.stamina.currentStamina < 30) return false;

        // 2. 주변 적 감지 (약 120px 이내)
        const aliveEnemies = enemies.filter(e => e.active && e.logic.isAlive);
        const threat = aliveEnemies.find(e => {
            return Phaser.Math.Distance.Between(entity.x, entity.y, e.x, e.y) < 120;
        });

        if (!threat) return false;

        // 3. 회피 방향 계산 (적의 반대 방향)
        const angle = Phaser.Math.Angle.Between(threat.x, threat.y, entity.x, entity.y);
        const dashDir = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };

        // 4. 대쉬 실행
        return entity.dash(dashDir);
    }
}

export default DashAI;
