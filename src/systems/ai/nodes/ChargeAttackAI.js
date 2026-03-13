import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 차지 어택 AI 노드 (Charge Attack AI Node)
 * 역할: [스킬 게이지가 찼을 때 군집 지역을 향해 스킬 사용]
 */
class ChargeAttackAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Array<CombatEntity>} enemies 
     */
    static update(entity, enemies) {
        if (!entity.hasSkill || entity.skillProgress < 1.0) return false;

        // 1. 적군 군집 분석
        const activeEnemies = enemies.filter(e => e.active && e.logic.isAlive);
        if (activeEnemies.length === 0) return false;

        // CoordinateManager를 통해 가장 뭉쳐있는 곳(중앙 지점) 찾기
        // (단순화를 위해 모든 적의 무게 중심을 사용하거나, 특정 범위 내 군집 탐색 가능)
        const targetPoint = coordinateManager.getCenterOfMass(activeEnemies);

        // 2. 사거리 확인 (돌진기이므로 넉넉하게 600px 이내면 사용)
        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, targetPoint.x, targetPoint.y);
        
        if (dist <= 600 && dist > 50) {
            // 3. 스킬 실행
            if (entity.skillData && entity.skillData.logic) {
                entity.skillData.logic.execute(entity, targetPoint);
                return true; // 스킬 사용 성공 (행동 선점)
            }
        }

        return false;
    }
}

export default ChargeAttackAI;
