import Logger from '../../../utils/Logger.js';
import animationManager from '../AnimationManager.js';

/**
 * 잠영 노드 (Sinking Node)
 * 역할: [체크 및 본체 은폐, 컨테이너화 시작]
 */
class SinkingNode {
    /**
     * @param {CombatEntity} entity 
     * @param {ShadowProjectile} projectile
     * @param {function} onComplete 
     */
    static execute(entity, projectile, onComplete) {
        if (!entity || !entity.active || !projectile) return;

        Logger.debug("SHADOW_DIVE", `${entity.logic.name} starts sinking.`);

        // 1. 상태 설정
        entity.isBusy = true;
        if (entity.status && entity.status.states) {
            entity.status.states.invincible = true;
        }
        
        // 2. 애니메이션 실행
        animationManager.playSinking(entity, 300, () => {
            // [FIX] 가라앉는 도중 타이머 해제
            if (entity.shadowSafetyTimer) {
                entity.shadowSafetyTimer.remove();
                entity.shadowSafetyTimer = null;
            }

            // 3. 컨테이너 탑승 (이동은 아직 안 함)
            projectile.containerize();

            if (onComplete) onComplete();
        });

        // [신규] 프리징 방지 안전장치
        if (entity.scene) {
            entity.shadowSafetyTimer = entity.scene.time.delayedCall(1500, () => {
                if (entity.active && entity.isBusy && !entity.isBeingCarried) {
                    Logger.warn("SHADOW_DIVE", `Sinking timeout for ${entity.logic.name}. Restoring state.`);
                    entity.isBusy = false;
                    if (entity.status && entity.status.states) {
                        entity.status.states.invincible = false;
                    }
                    entity.setVisible(true);
                    entity.shadowSafetyTimer = null;
                }
            });
        }
    }
}

export default SinkingNode;
