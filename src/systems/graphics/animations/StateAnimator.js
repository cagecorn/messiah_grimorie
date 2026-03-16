import phaserParticleManager from '../PhaserParticleManager.js';

/**
 * 상태 애니메이터 (State Animator)
 * 역할: [사망, 아이들링 등 유닛의 기본적인 상태 변화 연출 전담]
 */
class StateAnimator {
    constructor(animationManager) {
        this.am = animationManager;
    }

    get scene() { return this.am.scene; }

    /**
     * 사망 애니메이션
     */
    playDeathAnimation(entity, onComplete) {
        if (!this.scene || !entity || !entity.sprite) {
            if (onComplete) onComplete();
            return;
        }

        const sprite = entity.sprite;
        this.am.stopIdleBobbing(entity);
        this.scene.tweens.killTweensOf(sprite);

        if (entity.body) entity.body.setEnable(false);

        sprite.setTint(0xffffff);
        const fallAngle = sprite.flipX ? -90 : 90;

        this.scene.tweens.add({
            targets: sprite,
            angle: fallAngle,
            y: -10,
            duration: 300,
            ease: 'Cubic.in',
            onStart: () => sprite.setTint(0x666666),
            onComplete: () => {
                this.scene.tweens.add({
                    targets: sprite,
                    y: -25,
                    duration: 200,
                    ease: 'Cubic.out',
                    yoyo: true,
                    onComplete: () => {
                        if (phaserParticleManager.spawnSoul) {
                            const baseY = entity.y - (entity.zHeight || 0);
                            phaserParticleManager.spawnSoul(entity.x, baseY - 20);
                        }

                        this.scene.tweens.add({
                            targets: entity,
                            alpha: 0,
                            duration: 800,
                            delay: 200,
                            onComplete: () => {
                                sprite.setTint(0xffffff);
                                sprite.setAngle(0);
                                sprite.setY(0);
                                entity.alpha = 1;
                                if (onComplete) onComplete();
                            }
                        });
                    }
                });
            }
        });
    }

    /**
     * 유닛 아이들 바빙
     */
    playIdleBobbing(entity, className) {
        if (!this.scene || !entity || !entity.sprite || entity.idleBobbingTween) return;

        let amplitude = -4;
        let baseDuration = 1000;

        if (className === 'warrior') baseDuration = 1100;
        else if (className === 'archer') baseDuration = 900;

        entity.idleBobbingTween = this.scene.tweens.add({
            targets: entity.sprite,
            y: amplitude,
            duration: baseDuration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 아이들 바빙 중지
     */
    stopIdleBobbing(entity) {
        if (entity.idleBobbingTween) {
            entity.idleBobbingTween.stop();
            entity.idleBobbingTween = null;

            // [FIX] 기존 스프라이트 트윈(바빙 등) 확실히 제거하여 충돌 방지
            this.scene.tweens.killTweensOf(entity.sprite);

            // [수정] 대쉬 공격 등 다른 트윈이 시작될 때 충돌하지 않도록
            // 200ms 동안 복귀하는 트윈은 Busy 상태가 아닐 때만 시작하거나 즉시 0으로 설정
            if (!entity.isBusy) {
                this.scene.tweens.add({
                    targets: entity.sprite,
                    y: 0,
                    duration: 200,
                    ease: 'Cubic.out'
                });
            } else {
                entity.sprite.setY(0);
            }
        }
    }
}

export default StateAnimator;
