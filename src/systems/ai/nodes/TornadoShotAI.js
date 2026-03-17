import Logger from '../../../utils/Logger.js';
import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 토네이도 샷 AI 노드 (Tornado Shot AI Node)
 * 역할: [적들이 뭉쳐있는 직선 방향으로 관통 공격 결정]
 */
class TornadoShotAI {
    /**
     * @param {CombatEntity} entity 
     * @param {Array<CombatEntity>} enemies 
     */
    static update(entity, enemies) {
        // 1. 스킬 컴포넌트 및 쿨다운 체크
        const skillId = 'tornado_shot';
        if (!entity.skills || !entity.skills.isReady(skillId)) return false;

        // 2. 타겟팅: 적들이 가장 많이 뭉쳐있는 직선 경로 찾기
        const activeEnemies = enemies.filter(e => e.active && e.logic.isAlive);
        if (activeEnemies.length === 0) return false;

        // 사거리(700) 내의 적들 필터링
        const reachableEnemies = activeEnemies.filter(e => {
            return Phaser.Math.Distance.Between(entity.x, entity.y, e.x, e.y) <= 700;
        });

        if (reachableEnemies.length === 0) return false;

        // 밀집 지역 분석 (CoordinateManager 활용)
        // 관통 투사체는 경로상의 폭(Radius)을 고려해야 함 (80 정도가 적당)
        const targetPoint = coordinateManager.getBestAOETarget(reachableEnemies, 80);
        
        // 해당 지점을 향해 발사
        if (entity.skills.useSkill(skillId, targetPoint)) {
            Logger.info("AI", `${entity.logic.name} usage Tornado Shot targeting density area.`);
            return true;
        }

        return false;
    }
}

export default TornadoShotAI;
