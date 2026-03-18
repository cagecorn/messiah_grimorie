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
        
        // 3. 다시 나타나기 애니메이션
        if (animationManager) {
            animationManager.playEmerging(entity, 400, () => {
                this.clearStates(entity, onComplete);
            });

            // [신규] 프리징 방지 안전장치
            if (entity.scene) {
                entity.shadowSafetyTimer = entity.scene.time.delayedCall(1500, () => {
                    if (entity.active && entity.isBusy) {
                        Logger.warn("SHADOW_DIVE", `Emerging timeout for ${entity.logic.name}. Forcing state clear.`);
                        this.clearStates(entity, onComplete);
                    }
                });
            }
        } else {
            // 애니메이션 매니저가 없으면 즉시 종료 (이미지 실종 방지 포함)
            entity.setVisible(true);
            if (entity.sprite) entity.sprite.setVisible(true);
            this.clearStates(entity, onComplete);
        }
    }

    /**
     * [신규] 모든 상태 복구 통합 (무적/isBusy/타이머)
     */
    static clearStates(entity, onComplete) {
        if (!entity) return;

        // 1. 무적 해제
        if (entity.status && entity.status.states) {
            entity.status.states.invincible = false;
        }

        // 2. 타이머 정리
        if (entity.shadowSafetyTimer) {
            entity.shadowSafetyTimer.remove();
            entity.shadowSafetyTimer = null;
        }

        // 3. 행동 제약 해제
        entity.isBusy = false;

        Logger.info("SHADOW_DIVE", `${entity.logic.name} state reset complete.`);

        if (onComplete) onComplete();
    }
}

export default EmergingNode;
