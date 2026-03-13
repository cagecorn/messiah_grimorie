import Logger from '../../../utils/Logger.js';

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
     * 관통 효율이 가장 좋은 타겟 선정
     */
    static findBestClumpTarget(entity, enemies) {
        const aliveEnemies = enemies.filter(e => e.active && e.logic.isAlive);
        if (aliveEnemies.length === 0) return null;

        let bestTarget = null;
        let maxImpact = -1;

        // 모든 적을 후보로 두고, 그 적을 향해 쐈을 때 경로상에 다른 적이 얼마나 있는지 체크
        aliveEnemies.forEach(candidate => {
            const dist = Phaser.Math.Distance.Between(entity.x, entity.y, candidate.x, candidate.y);
            if (dist > 800) return; // 사거리 밖

            // 경로 벡터
            const angle = Phaser.Math.Angle.Between(entity.x, entity.y, candidate.x, candidate.y);
            
            // 이 경로 주변(선형)에 있는 적의 수 계산
            let count = 0;
            aliveEnemies.forEach(other => {
                // 선분과 점 사이의 거리 계산 (단순화: 각도 차이로 계산)
                const otherAngle = Phaser.Math.Angle.Between(entity.x, entity.y, other.x, other.y);
                const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angle - otherAngle));
                
                if (angleDiff < 0.1) { // 약 5도 이내
                    count++;
                }
            });

            if (count > maxImpact) {
                maxImpact = count;
                bestTarget = candidate;
            }
        });

        return bestTarget;
    }
}

export default KnockbackShotAI;
