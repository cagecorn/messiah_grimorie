import Phaser from 'phaser';
import combatManager from '../../CombatManager.js';

/**
 * 용병 목줄 AI (Group Leash AI)
 * 역할: [아군 그룹 중심에서 너무 멀어지지 않도록 관리]
 * 
 * 설명: 용병이 그룹의 무게 중심에서 일정 거리(400px) 이상 벗어나면 
 * 강제로 중심 방향으로 이동 벡터를 부여하여 대열을 유지합니다.
 */
class GroupLeashAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Array<CombatEntity>} allies 
     * @param {number} leashRange 
     * @returns {object|null} 이동 방향 {x, y} 또는 null
     */
    static execute(entity, allies, leashRange = 650) {
        if (!entity || !allies || allies.length <= 1) return null;

        // 1. [FIX] 매번 O(N)으로 계산하지 않고 CombatManager에서 미리 계산된 중심점 사용
        const center = combatManager.centerOfMass;
        
        // 2. 중심과의 거리 계산
        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, center.x, center.y);

        // 3. 거리 임계값 초과 시 중심 방향으로 이동 지시
        if (dist > leashRange) {
            const angle = Phaser.Math.Angle.Between(entity.x, entity.y, center.x, center.y);
            return {
                x: Math.cos(angle),
                y: Math.sin(angle)
            };
        }

        return null;
    }
}

export default GroupLeashAI;
