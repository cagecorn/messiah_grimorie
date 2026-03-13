import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import combatManager from '../CombatManager.js';

/**
 * AOE 매니저 (AOE Manager)
 * 역할: [범위 판정 및 데미지 일괄 적용]
 */
class AOEManager {
    /**
     * 범위 데미지 적용
     * @param {CombatEntity} source 시전자
     * @param {number} x 중심 X
     * @param {number} y 중심 Y
     * @param {number} radius 반경
     * @param {number} multiplier 계수
     * @param {string} type 데미지 속성
     * @param {function} onHit 각 타겟 피격 시 콜백
     * @param {boolean} isUltimate 궁극기 여부
     */
    applyAOEDamagingEffect(source, x, y, radius, multiplier, type, onHit, isUltimate = false) {
        if (!source || !source.scene) return;

        const scene = source.scene;
        // 씬 내의 모든 전투 엔티티 가져오기 (BattleScene에 리스트가 있다고 가정)
        const allEntities = scene.spawnManager ? scene.spawnManager.getActiveEntities(scene) : [];
        
        const targets = allEntities.filter(target => {
            if (!target.active || !target.logic.isAlive) return false;
            // 적대 관계 확인 (시전자와 다른 팀)
            if (target.team === source.team) return false;

            // 거리 계산
            const dist = Phaser.Math.Distance.Between(x, y, target.x, target.y);
            return dist <= radius;
        });

        targets.forEach(target => {
            // 데미지 처리 (CombatManager에 의뢰)
            combatManager.processDamage(source, target, multiplier, type, isUltimate);
            
            if (onHit) onHit(target);
        });

        if (targets.length > 0) {
            Logger.info("COMBAT", `AOE Hit: ${targets.length} targets affected by ${source.logic.name}.`);
        }
    }
}

const aoeManager = new AOEManager();
export default aoeManager;
