import Phaser from 'phaser';

/**
 * 엔티티 비주얼 컴포넌트 (Entity Visual Component)
 * 역할: [스프라이트 관리, 애니메이션, 시각적 상태 전담]
 */
export default class EntityVisualComponent {
    constructor(entity, animationManager, fxManager, shadowManager, layerManager) {
        this.entity = entity;
        this.scene = entity.scene;
        this.animationManager = animationManager;
        this.fxManager = fxManager;
        this.shadowManager = shadowManager;
        this.layerManager = layerManager;
        
        this.sprite = null;
        this.isIdle = false;
        this.idleBobbingTween = null;
    }

    /**
     * 스프라이트 초기화 및 설정
     */
    init(spriteKey, scale) {
        if (!this.sprite) {
            this.sprite = this.scene.add.sprite(0, 0, spriteKey);
            this.sprite.setOrigin(0.5, 1.0);
            this.entity.add(this.sprite);
        } else {
            this.sprite.setTexture(spriteKey);
            this.sprite.setAngle(0);
            this.sprite.setPosition(0, 0);
            this.sprite.setAlpha(1);
            this.sprite.clearTint();
        }
        this.sprite.setScale(scale);
        
        // 초기 방향 설정
        if (this.entity.logic.type === 'mercenary') {
            this.sprite.setFlipX(true);
        } else {
            this.sprite.setFlipX(false);
        }
    }

    /**
     * 외부 매니저 연결 (모든 컴포넌트가 준비된 후 호출)
     */
    attachManagers() {
        this.fxManager.attachHUD(this.entity);
        this.shadowManager.createShadow(this.scene, this.entity);
    }

    /**
     * 텍스처 업데이트
     */
    updateTexture(spriteKey) {
        if (this.sprite) {
            this.sprite.setTexture(spriteKey);
        }
    }

    /**
     * 방향 전환
     */
    setFlipX(flip) {
        if (this.sprite) {
            this.sprite.setFlipX(flip);
        }
    }

    /**
     * 기본 스케일 강제 복구 (트윈 중단 대비 안전장치)
     */
    restoreBaseScale() {
        if (!this.sprite) return;
        const config = this.entity.getEntityConfig();
        this.sprite.setScale(config.displayScale);
    }

    /**
     * 아이들 상태 체크 및 바빙 애니메이션 제어
     */
    updateIdleState() {
        if (!this.entity.active || !this.entity.logic.isAlive) return;

        // [신규] 은신 상태 시각화 (반투명 처리)
        const targetAlpha = this.entity.isStealthed ? 0.4 : (this.entity.logic.isSpecial ? 0.6 : 1.0);
        if (this.sprite && this.sprite.alpha !== targetAlpha) {
            this.sprite.setAlpha(targetAlpha);
        }

        // 1. 상태 판정 (물리적 이동 중이거나 행동 불가인 경우 제외)
        const isMoving = this.entity.body && this.entity.body.speed > 5;
        const isUnableToAct = this.entity.status && this.entity.status.isUnableToAct();
        
        const isIdleNow = !isMoving && !isUnableToAct && !this.entity.isBusy && !this.entity.isJumping;

        if (isIdleNow !== this.isIdle) {
            this.isIdle = isIdleNow;
            if (this.isIdle) {
                // [FIX] 아이들 진입 시 혹시 남아있을 수 있는 연출용 스케일링 강제 초기화
                this.restoreBaseScale();
                
                const className = this.entity.logic.class ? this.entity.logic.class.getClassName() : 'default';
                this.animationManager.playIdleBobbing(this.entity, className);
            } else {
                this.animationManager.stopIdleBobbing(this.entity);
            }
        }
    }

    /**
     * 깊이 정렬 업데이트
     */
    updateDepth(baseDepth, measurementManager) {
        const worldHeight = measurementManager.world.height;
        const yBias = this.entity.y / worldHeight;
        this.entity.setDepth(baseDepth + yBias);
    }

    /**
     * 시각 효과 및 리소스 해제
     */
    cleanup() {
        this.fxManager.detachHUD(this.entity);
        this.shadowManager.removeShadow(this.entity);
        this.animationManager.stopIdleBobbing(this.entity);
        
        // [FIX] 풀에 반납되거나 파괴될 때 스케일 확실히 복구
        this.restoreBaseScale();
        
        this.isIdle = false;
    }
}
