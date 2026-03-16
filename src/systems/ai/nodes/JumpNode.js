import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import { STAMINA } from '../../../core/TechnicalConstants.js';
import animationManager from '../../graphics/AnimationManager.js';

/**
 * 점프 노드 (Jump Node)
 * 역할: [스태미나를 소모하여 대상에게 급격히 접근]
 */
class JumpNode {
    /**
     * @param {CombatEntity} entity 
     * @param {CombatEntity} target 
     * @returns {boolean} 성공 여부
     */
    static execute(entity, target) {
        if (!entity || !target || !entity.logic.isAlive) return false;

        // 1. 상태 체크 (이미 이동 중이거나 행동 불가면 스킵)
        if (entity.isBusy || entity.isJumping) return false;
        if (entity.status && entity.status.isUnableToAct()) return false;

        // 2. 스태미나 체크 (중앙화된 상수 사용)
        const STAMINA_COST = STAMINA.JUMP_COST;
        if (!entity.stamina || entity.stamina.currentStamina < STAMINA_COST) return false;

        // 3. 거리 체크 (너무 가깝거나 너무 멀면 스킵)
        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, target.x, target.y);
        if (dist < 150 || dist > 600) return false;

        // 4. 점프 수행 (스태미나 소모)
        if (!entity.stamina.consume(STAMINA_COST)) return false;
        entity.isJumping = true;
        entity.isBusy = true;

        // [FIX] 점프 시작 전 아이들 바빙 중지
        animationManager.stopIdleBobbing(entity);

        const startX = entity.x;
        const startY = entity.y;
        
        // 타겟의 살짝 앞쪽으로 도착지 설정
        let angle = Phaser.Math.Angle.Between(startX, startY, target.x, target.y);
        
        // [신규] 전술적 오프셋 적용 (분신 등이 겹치지 않게 다른 각도로 착지 유도)
        if (entity.ai_tacticalOffset) {
            angle += entity.ai_tacticalOffset * 0.8;
        }

        const targetX = target.x - Math.cos(angle) * 50;
        const targetY = target.y - Math.sin(angle) * 50;

        Logger.info("AI_JUMP", `${entity.logic.name} leaps towards ${target.logic.name}! (Dist: ${dist.toFixed(0)})`);

        // [시각 연출] 아치형 점프
        entity.scene.tweens.add({
            targets: entity,
            x: targetX,
            y: targetY,
            duration: 500,
            ease: 'Cubic.easeOut',
            onUpdate: (tween) => {
                // Y축 오프셋으로 포물선 표현
                const progress = tween.progress;
                const jumpHeight = 100 * Math.sin(Math.PI * progress);
                if (entity.visual && entity.visual.sprite) {
                    entity.visual.sprite.y = -jumpHeight;
                }
            },
            onComplete: () => {
                entity.isJumping = false;
                entity.isBusy = false;
                if (entity.visual && entity.visual.sprite) {
                    entity.visual.sprite.y = 0;
                }
                Logger.info("AI_JUMP", `${entity.logic.name} landed.`);
            }
        });

        return true;
    }
}

export default JumpNode;
