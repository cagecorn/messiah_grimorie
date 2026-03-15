import Logger from '../../../utils/Logger.js';
import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 넉백 샷 AI 노드 (Knockback Shot AI Node)
 * 역할: [적들이 뭉쳐있는 직선 방향으로 스킬 사용 결정]
 */
class KnockbackShotAI {
    /**
     * 실행 조건 체크 및 실행
     */
    static tick(entity, allies, enemies) {
        // 1. 스킬 컴포넌트 및 쿨다운 체크
        const skill = entity.skills ? entity.skills.getSkill('knockback_shot') : null;
        if (!skill || !entity.skills.isReady('knockback_shot')) return false;

        // 2. 타겟팅: 적들이 가장 많이 뭉쳐있는 방향 찾기
        // (단순화: 가장 가까운 적을 기준으로 그 주변에 적이 더 있는지 보거나, 
        // 관통 효율이 좋은 각도 계산)
        const target = this.findBestClumpTarget(entity, enemies);
        if (!target) return false;

        // 3. 스킬 실행
        entity.skills.useSkill('knockback_shot', target);
        Logger.info("AI", `${entity.logic.name} decided to use Knockback Shot!`);
        return true;
    }

    /**
     * 관통 효율이 가장 좋은 타겟 선정 (CoordinateManager 기반)
     */
    static findBestClumpTarget(entity, enemies) {
        const aliveEnemies = enemies.filter(e => e.active && e.logic.isAlive);
        if (aliveEnemies.length === 0) return null;

        // 사거리(800) 내의 적들만 필터링
        const reachableEnemies = aliveEnemies.filter(e => {
            return Phaser.Math.Distance.Between(entity.x, entity.y, e.x, e.y) <= 800;
        });

        if (reachableEnemies.length === 0) return null;

        // 밀집 지역 분석 (넉백샷은 직선이므로 반경을 80 정도로 잡아 경로상의 적 탐색)
        const targetPoint = coordinateManager.getBestAOETarget(reachableEnemies, 80);
        
        // 해당 지점의 적 중 하나 반환
        return reachableEnemies.find(e => e.x === targetPoint.x && e.y === targetPoint.y) || reachableEnemies[0];
    }
}

export default KnockbackShotAI;
