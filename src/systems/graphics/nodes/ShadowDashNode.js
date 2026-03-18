import Logger from '../../../utils/Logger.js';

/**
 * 그림자 대쉬 노드 (Shadow Dash Node)
 * 역할: [이동 시작, 무적 상태 부여 및 좌표 동기화 관리]
 */
class ShadowDashNode {
    /**
     * @param {CombatEntity} entity 
     * @param {ShadowProjectile} projectile 
     */
    static execute(entity, projectile) {
        if (!entity || !entity.active || !projectile) return;

        // 1. 안전장치: 제대로 탑승했는지 확인
        if (!entity.isBeingCarried) {
            Logger.error("SHADOW_DIVE", `Safety check failed: ${entity.logic.name} is not in container!`);
            entity.isBusy = false;
            return;
        }

        Logger.debug("SHADOW_DIVE", `${entity.logic.name} starts shadow dash.`);

        // 2. 상태 설정
        if (entity.status && entity.status.states) {
            entity.status.states.invincible = true;
        }
        entity.isBusy = true;

        // 3. 투사체 이동 시작
        projectile.startDash();
    }
}

export default ShadowDashNode;
