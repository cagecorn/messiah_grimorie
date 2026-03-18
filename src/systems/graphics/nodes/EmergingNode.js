import Logger from '../../../utils/Logger.js';
import animationManager from '../AnimationManager.js';

/**
 * 출현 노드 (Emerging Node)
 * 역할: [본체 해제, 출현 애니메이션 및 상태 복구]
 */
class EmergingNode {
    /**
     * @param {CombatEntity} entity 
     * @param {ShadowProjectile} projectile 
     * @param {function} onComplete 
     */
    static execute(entity, projectile, onComplete) {
        if (!entity || !projectile) {
            if (onComplete) onComplete();
            return;
        }

        Logger.debug("SHADOW_DIVE", `${entity.logic.name} starts emerging.`);

        // 1. 본체 해제 (Container -> Scene)
        projectile.releaseUnit();
        
        // 2. 상태 설정 (무적 해제)
        if (entity.status && entity.status.states) {
            entity.status.states.invincible = false;
        }

        // 3. 다시 나타나기 애니메이션
        if (animationManager) {
            animationManager.playEmerging(entity, 400, () => {
                // [FIX] 비정상 루프 방지용 타이머 해제
                if (this.safetyTimer) this.safetyTimer.remove();

                // 4. 행동 제약 해제
                entity.isBusy = false;
                Logger.info("SHADOW_DIVE", `${entity.logic.name} emerged from shadows.`);

                if (onComplete) onComplete();
            });

            // [신규] 프리징 방지 안전장치
            if (entity.scene) {
                this.safetyTimer = entity.scene.time.delayedCall(1500, () => {
                    if (entity.active && entity.isBusy) {
                        Logger.warn("SHADOW_DIVE", `Emerging timeout for ${entity.logic.name}. Forcing state clear.`);
                        entity.isBusy = false;
                        if (onComplete) onComplete();
                    }
                });
            }
        } else {
            // 애니메이션 매니저가 없으면 즉시 종료 (이미지 실종 방지 포함)
            entity.setVisible(true);
            if (entity.sprite) entity.sprite.setVisible(true);
            entity.isBusy = false;
            if (onComplete) onComplete();
        }
    }
}

export default EmergingNode;
