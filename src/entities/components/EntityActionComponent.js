import Logger from '../../utils/Logger.js';
import animationManager from '../../systems/graphics/AnimationManager.js';
import phaserParticleManager from '../../systems/graphics/PhaserParticleManager.js';

/**
 * 엔티티 액션 컴포넌트 (Entity Action Component)
 * 역할: [구르기, 대쉬 등 특수 동작의 논리 및 상태 관리]
 * 
 * 특징:
 * 1. 무적 판정(I-frames): 액션 중 데미지 면역 처리
 * 2. 스태미나 연동: 액션 시작 시 자원 소모 체크
 * 3. 이동 연동: 물리 엔진에 일시적인 가속 부여
 */
export default class EntityActionComponent {
    constructor(entity) {
        this.entity = entity;
        this.isRolling = false;
        this.iFrameActive = false;
        this.actionCooldown = 0;
    }

    /**
     * 컴포넌트 리셋 (풀링 대응)
     */
    reset() {
        this.isRolling = false;
        this.iFrameActive = false;
        this.actionCooldown = 0;
    }

    /**
     * 프레임 업데이트
     */
    update(delta) {
        if (this.actionCooldown > 0) {
            this.actionCooldown -= delta;
        }
    }

    /**
     * 구르기 실행 (Roll)
     * @param {Object} direction {x, y} 이동 방향 벡터 (정규화된 상태여야 함)
     */
    roll(direction) {
        if (this.isRolling || this.actionCooldown > 0) return false;

        const rollStaminaCost = 30; // 기본 소모량
        if (!this.entity.stamina || !this.entity.stamina.consume(rollStaminaCost)) {
            Logger.debug("ACTION", `${this.entity.logic.name} - 스태미나 부족으로 구르기 실패`);
            return false;
        }

        this.startRoll(direction);
        return true;
    }

    /**
     * 실제 구르기 물리 및 연출 시작
     */
    startRoll(direction) {
        this.isRolling = true;
        this.iFrameActive = true;
        this.actionCooldown = 800; // 구르기 자체 쿨타임

        const rollDuration = 400;
        const rollSpeed = 600; // [FIX] 더 빠르고 역동적인 이동을 위해 상향 (기존 400)

        // 1. 시각적 연출 실행 (회전 + 잔상 + 먼지 효과)
        animationManager.playRollAnimation(this.entity, rollDuration);
        phaserParticleManager.spawnWhiteDust(this.entity.x, this.entity.y);

        // 2. 물리적 가속 부여 (MovementComponent 직접 제어 대신 body 조작)
        if (this.entity.body) {
            this.entity.body.setVelocity(direction.x * rollSpeed, direction.y * rollSpeed);
        }

        // 3. 상태 해제 타이머 (I-frames 및 이동 중지)
        this.entity.scene.time.delayedCall(rollDuration, () => {
            this.finishRoll();
        });

        Logger.debug("ACTION", `${this.entity.logic.name} - 구르기 시작!`);
    }

    /**
     * 구르기 종료 처리
     */
    finishRoll() {
        this.isRolling = false;
        this.iFrameActive = false;
        
        if (this.entity.body) {
            this.entity.body.setVelocity(0, 0);
        }
        
        Logger.debug("ACTION", `${this.entity.logic.name} - 구르기 종료`);
    }

    /**
     * 현재 데미지를 무시할 수 있는 상태인지 체크
     */
    isInvincible() {
        return this.iFrameActive;
    }
}
