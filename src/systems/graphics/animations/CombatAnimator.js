import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';
import phaserParticleManager from '../PhaserParticleManager.js';
import ghostManager from '../GhostManager.js';

/**
 * 컴뱃 애니메이터 (Combat Animator)
 * 역할: [피격, 돌진, 구르기 등 직접적인 전투 액션 연출 전담]
 */
class CombatAnimator {
    constructor(animationManager) {
        this.am = animationManager;
    }

    get scene() { return this.am.scene; }

    /**
     * 피격 효과
     */
    playHitEffect(target, type = 'physical') {
        if (!this.scene || !target || !target.active) return;
        if (type !== 'physical') return;

        const effect1 = poolingManager.get('impact_effect');
        if (effect1) effect1.show(target, 'impact_phys_1');

        this.scene.time.delayedCall(50, () => {
            const effect2 = poolingManager.get('impact_effect');
            if (effect2) effect2.show(target, 'impact_phys_2');
        });
    }

    /**
     * 스킬 전용 고속 돌진
     */
    playSkillDash(entity, targetPos, onComplete) {
        if (!this.scene || !entity || !targetPos) return;

        const dx = targetPos.x - entity.x;
        const dy = targetPos.y - entity.y;
        const angle = Math.atan2(dy, dx);
        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, targetPos.x, targetPos.y);

        const pooledFx = poolingManager.get('charge_attack_fx');
        const trajectory = pooledFx.sprite;

        trajectory.setPosition(entity.x, entity.y);
        trajectory.setOrigin(0, 0.5);
        trajectory.setRotation(angle);
        trajectory.setAlpha(1.0);
        trajectory.setBlendMode(Phaser.BlendModes.ADD);
        trajectory.setDepth(entity.depth - 1);
        trajectory.setDisplaySize(dist, 320);

        const originalScaleX = entity.sprite.scaleX;
        entity.sprite.scaleX = originalScaleX * 1.5;

        const ghostTimer = this.scene.time.addEvent({
            delay: 20,
            repeat: Math.floor(dist / 25),
            callback: () => {
                if (!entity.active || !entity.sprite) return;
                ghostManager.spawnGhost(entity, { lifeTime: 300, tint: 0x00ffff, alpha: 0.6 });
                if (phaserParticleManager.spawnWhiteDust) phaserParticleManager.spawnWhiteDust(entity.x, entity.y);
            }
        });

        this.scene.tweens.add({
            targets: entity,
            x: targetPos.x,
            y: targetPos.y,
            duration: 180,
            ease: 'Cubic.out',
            onComplete: () => {
                entity.sprite.scaleX = originalScaleX;
                if (ghostTimer) ghostTimer.remove();

                this.scene.tweens.add({
                    targets: trajectory,
                    alpha: 0,
                    scaleY: 0.5,
                    duration: 400,
                    ease: 'Quad.out',
                    onComplete: () => poolingManager.release('charge_attack_fx', pooledFx)
                });

                if (onComplete) onComplete();
            }
        });
    }

    /**
     * 구르기 애니메이션
     */
    playRollAnimation(entity, duration = 400) {
        if (!this.scene || !entity || !entity.sprite) return;

        const sprite = entity.sprite;
        const ghostTimer = this.scene.time.addEvent({
            delay: 25, // [FIX] 더 촘촘한 잔상을 위해 지연 시간 단축 (기존 40)
            repeat: Math.floor(duration / 25),
            callback: () => {
                if (!entity.active || !sprite) return;
                ghostManager.spawnGhost(entity, { lifeTime: 300, tint: 0x00ffff, alpha: 0.5 });
                if (phaserParticleManager.spawnWhiteDust) phaserParticleManager.spawnWhiteDust(entity.x, entity.y);
            }
        });

        const rotationAngle = sprite.flipX ? 360 : -360;
        this.scene.tweens.add({
            targets: sprite,
            angle: rotationAngle,
            duration: duration,
            ease: 'Cubic.out',
            onComplete: () => {
                sprite.setAngle(0);
                if (ghostTimer) ghostTimer.remove();
            }
        });
    }

    /**
     * 평타 대쉬 공격
     */
    playDashAttack(entity, target, onHit) {
        if (!this.scene || !entity || !target || !entity.sprite) return;

        // [FIX] 공격 대쉬 시작 전 아이들 바빙 중지
        this.am.stopIdleBobbing(entity);

        const dx = target.x - entity.x;
        const dy = target.y - entity.y;
        const dashX = dx * 0.4;
        const dashY = dy * 0.4;

        const ghostTimer = this.scene.time.addEvent({
            delay: 20,
            repeat: 4,
            callback: () => {
                if (!entity.active || !entity.sprite) return;
                ghostManager.spawnGhost(entity, { lifeTime: 200, tint: 0x00ffff, alpha: 0.4 });
            }
        });

        this.scene.tweens.add({
            targets: entity.sprite,
            x: dashX,
            y: dashY,
            duration: 100,
            ease: 'Cubic.out',
            onComplete: () => {
                if (onHit) onHit();
                this.scene.tweens.add({
                    targets: entity.sprite,
                    x: 0,
                    y: 0,
                    duration: 200,
                    ease: 'Back.out',
                    onComplete: () => {
                        // [FIX] 대쉬-리턴 시퀀스가 완전히 종료된 후 Busy 해제
                        entity.isBusy = false;
                    }
                });
            }
        });
    }
}

export default CombatAnimator;
