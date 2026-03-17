import Phaser from 'phaser';

/**
 * 탈출 AI 노드 (Escape AI Node)
 * 역할: [적이 근접했을 때 구르기를 통해 거리를 벌림]
 * 적용 대상: Healer, Wizard, Bard (지상 유닛)
 */
class EscapeAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Array<CombatEntity>} enemies 
     */
    static tick(entity, enemies) {
        if (!entity || !entity.active || entity.isRolling()) return false;

        // 1. 클래스 체크 (Healer, Wizard, Bard 전용)
        const className = entity.logic.class.getClassName();
        const targetClasses = ['healer', 'wizard', 'bard'];
        if (!targetClasses.includes(className)) return false;

        // 2. 스태미나 체크 (30 소모)
        if (!entity.stamina || entity.stamina.currentStamina < 30) return false;

        // 3. 주변 적 감지 (약 150px 이내)
        const aliveEnemies = enemies.filter(e => e.active && e.logic.isAlive);
        const threat = aliveEnemies.find(e => {
            return Phaser.Math.Distance.Between(entity.x, entity.y, e.x, e.y) < 150;
        });

        if (!threat) return false;

        // 4. 회피 방향 계산 (적의 반대 방향)
        const angle = Phaser.Math.Angle.Between(threat.x, threat.y, entity.x, entity.y);
        const rollDir = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };

        // 5. 구르기 실행
        return entity.roll(rollDir);
    }
}

export default EscapeAI;
