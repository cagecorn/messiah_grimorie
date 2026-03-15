import Phaser from 'phaser';

/**
 * 2. 투사체 분류 및 분석 노드 (Projectile Classifier)
 * 역할: [감지된 투사체가 나에게 위협적인지, 어떤 종류(Target/NonTarget)인지 분석]
 */
class ProjectileClassifier {
    /**
     * 투사체 위협 분석
     * @param {CombatEntity} entity 분석 주체 
     * @param {object} projData Sensor에서 전달받은 데이터
     * @param {number} buffer 안전 반경
     */
    static analyze(entity, projData, buffer = 60) {
        const proj = projData.projectile;
        
        // A. 타겟팅 투사체 (TargetProjectile 계열)
        // targetPos가 없고 target entity를 직접 추적하는 경우
        if (proj.target && proj.target === entity) {
            return {
                type: 'target',
                isThreat: true,
                priority: 10,
                projectile: proj
            };
        }

        // B. 논타겟 투사체 (NonTargetProjectile 계열)
        if (proj.targetPos) {
            const danger = this.checkNonTargetDanger(entity, proj, buffer);
            if (danger.isThreat) {
                return {
                    type: 'nonTele',
                    isThreat: true,
                    priority: 20, // 논타겟은 피할 수 있으므로 반응 우선순위 높임
                    projectile: proj,
                    dodgeDir: danger.dodgeDir
                };
            }
        }

        return { isThreat: false };
    }

    /**
     * 논타겟 투사체의 궤적 분석 (기존 DodgeAI 로직)
     */
    static checkNonTargetDanger(entity, proj, buffer) {
        const entityPos = new Phaser.Math.Vector2(entity.x, entity.y);
        const projPos = new Phaser.Math.Vector2(proj.x, proj.y);
        const targetPos = new Phaser.Math.Vector2(proj.targetPos.x, proj.targetPos.y);

        const trajectoryVec = targetPos.clone().subtract(projPos);
        const trajectoryLen = trajectoryVec.length();
        if (trajectoryLen < 1) return { isThreat: false };

        const normalizedTrajectory = trajectoryVec.clone().normalize();
        const toEntityVec = entityPos.clone().subtract(projPos);
        const projection = toEntityVec.dot(normalizedTrajectory);
        
        // 투사체 진행 방향에 내가 있는지 확인
        if (projection < -20 || projection > trajectoryLen + 50) {
            return { isThreat: false };
        }

        const crossProduct = toEntityVec.x * normalizedTrajectory.y - toEntityVec.y * normalizedTrajectory.x;
        const perpendicularDist = Math.abs(crossProduct);

        const threshold = (proj.collisionRadius || 40) + buffer;
        if (perpendicularDist < threshold) {
            const dodgeAngle = (crossProduct > 0) ? Math.PI / 2 : -Math.PI / 2;
            const moveAngle = Math.atan2(normalizedTrajectory.y, normalizedTrajectory.x) + dodgeAngle;

            return {
                isThreat: true,
                dodgeDir: {
                    x: Math.cos(moveAngle),
                    y: Math.sin(moveAngle)
                }
            };
        }

        return { isThreat: false };
    }
}

export default ProjectileClassifier;
