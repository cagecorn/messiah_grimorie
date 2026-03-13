import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import poolingManager from '../../core/PoolingManager.js';
import phaserParticleManager from './PhaserParticleManager.js';
import ghostManager from './GhostManager.js';

// [모듈화된 이펙트 임포트]
import PooledHitEffect from './effects/PooledHitEffect.js';
import PooledSkillEffect from './effects/PooledSkillEffect.js';
import PooledHealingEffect from './effects/PooledHealingEffect.js';
import PooledMassHealCircle from './effects/PooledMassHealCircle.js';
import PooledSummonEffect from './effects/PooledSummonEffect.js';

/**
 * 애니메이션 매니저 (Animation Manager)
 * 역할: [유닛의 역동적인 연출 로직 담당]
 * 
 * 🦖 거대한 갓 오브젝트를 길들이는 꼼수 준수:
 * 1. 시각적 모듈화 (#region) 적용
 * 2. 물리적 모듈화 (이펙트 자식 클래스 분리)
 */
class AnimationManager {
    constructor() {
        this.scene = null;
    }

    //#region 🛠️ [초기화 세션]
    init(scene) {
        this.scene = scene;

        // [신규] 피격 이펙트 풀 등록 (초기 50개로 상향 - 대규모 전투 대비)
        poolingManager.registerPool('impact_effect', () => new PooledHitEffect(this.scene), 50);

        // [USER 요청] 차지 어택 및 궁극기 기둥 효과 풀링
        poolingManager.registerPool('charge_attack_fx', () => new PooledSkillEffect(this.scene, 'charge_attack'), 5);
        poolingManager.registerPool('for_messiah_pillar', () => new PooledSkillEffect(this.scene, 'for_messiah'), 3);
        poolingManager.registerPool('healing_effect', () => new PooledHealingEffect(this.scene), 60);
        poolingManager.registerPool('mass_heal_circle', () => new PooledMassHealCircle(this.scene), 20);
        poolingManager.registerPool('summon_guardian_angel_fx', () => new PooledSummonEffect(this.scene), 30);

        Logger.system("AnimationManager: Tactics-style animation system ready.");
    }
    //#endregion

    //#region 💚 [힐링 & 서포트 이펙트]
    /**
     * 힐러 평타 힐링 이펙트 재생
     * [USER 요청] 6장을 시차를 두고 중첩하여 연출 (ADD 모드)
     */
    playHealingEffect(target) {
        if (!this.scene || !target || !target.active) return;
        
        for (let i = 0; i < 6; i++) {
            this.scene.time.delayedCall(i * 50, () => {
                if (!target || !target.active) return;
                
                const effect = poolingManager.get('healing_effect');
                if (effect) {
                    effect.show(target);
                }
            });
        }

        if (phaserParticleManager.spawnHealBurst) {
            phaserParticleManager.spawnHealBurst(target.x, target.y - 20);
        }
    }

    /**
     * 매스 힐 써클 효과 재생 (세라 중심)
     * [USER 요청] 여러 장을 겹쳐서 회전 연출
     */
    playMassHealEffect(owner) {
        if (!this.scene || !owner || !owner.active) return;

        const layer1 = poolingManager.get('mass_heal_circle');
        if (layer1) layer1.show(owner, { scale: 1.0, alpha: 0.6, rotateSpeed: 360, startAngle: 0 });

        const layer2 = poolingManager.get('mass_heal_circle');
        if (layer2) layer2.show(owner, { scale: 1.2, alpha: 0.4, rotateSpeed: -480, startAngle: 45 });

        const layer3 = poolingManager.get('mass_heal_circle');
        if (layer3) layer3.show(owner, { scale: 0.8, alpha: 0.3, rotateSpeed: 720, startAngle: 90 });
    }
    //#endregion

    //#region 👼 [소환 & 궁극기 이펙트]
    /**
     * 수호천사 소환 이펙트 재생
     * [USER 요청] 6장을 시차를 두고 중첩 연출
     * [USER 요청] Y축 위로 높게 배치하여 '후광' 느낌 연출
     */
    playGuardianAngelSummonVFX(x, y) {
        if (!this.scene) return;

        const verticalOffset = -80; // 후광 느낌을 위해 위로 올림

        for (let i = 0; i < 6; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                const fx = poolingManager.get('summon_guardian_angel_fx');
                if (fx) {
                    fx.show(x, y + verticalOffset, { scale: 3.0, alpha: 0.7, duration: 1500 });
                }
            });
        }
    }

    /**
     * 수호천사 강화 이펙트 재생
     * [USER 요청] 4장을 시차를 두고 중첩 연출
     * [USER 요청] Y축 위로 높게 배치하여 '후광' 느낌 연출
     */
    playGuardianAngelUpgradeVFX(target, tint) {
        if (!this.scene || !target || !target.active) return;

        const verticalOffset = -100; // 유닛 머리 위 후광

        for (let i = 0; i < 4; i++) {
            this.scene.time.delayedCall(i * 80, () => {
                if (!target || !target.active) return;
                const fx = poolingManager.get('summon_guardian_angel_fx');
                if (fx) {
                    fx.show(target.x, target.y + verticalOffset, { scale: 4.5, alpha: 0.8, duration: 1000, tint: tint });
                }
            });
        }
    }
    //#endregion

    //#region ⚔️ [전투 & 타격 애니메이션]
    /**
     * 피격 이펙트 애니메이션 (Impact Effect)
     */
    playHitEffect(target, type = 'physical') {
        if (!this.scene || !target || !target.active) return;

        let key = '';
        if (type === 'physical') {
            key = Math.random() < 0.5 ? 'impact_phys_1' : 'impact_phys_2';
        } else {
            return;
        }

        if (type === 'physical') {
            const effect1 = poolingManager.get('impact_effect');
            if (effect1) {
                effect1.show(target, 'impact_phys_1');
            }

            this.scene.time.delayedCall(50, () => {
                const effect2 = poolingManager.get('impact_effect');
                if (effect2) {
                    effect2.show(target, 'impact_phys_2');
                }
            });
        } else {
            const effect = poolingManager.get('impact_effect');
            if (effect) {
                effect.show(target, key);
            }
        }
    }

    /**
     * 스킬 전용 고속 돌진 애니메이션 (Charge Attack 등)
     */
    playSkillDash(entity, targetPos, onComplete) {
        if (!this.scene || !entity || !targetPos) return;

        this.scene.cameras.main.shake(100, 0.003);

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
                ghostManager.spawnGhost(entity, {
                    lifeTime: 300,
                    tint: 0x00ffff,
                    alpha: 0.6
                });
                if (phaserParticleManager.spawnWhiteDust) {
                    phaserParticleManager.spawnWhiteDust(entity.x, entity.y);
                }
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
     * 평타 대쉬 애니메이션 실행
     */
    playDashAttack(entity, target, onHit) {
        if (!this.scene || !entity || !target || !entity.sprite) return;

        const dx = target.x - entity.x;
        const dy = target.y - entity.y;
        const dashX = dx * 0.4;
        const dashY = dy * 0.4;

        const ghostTimer = this.scene.time.addEvent({
            delay: 20,
            repeat: 4,
            callback: () => {
                if (!entity.active || !entity.sprite) return;
                ghostManager.spawnGhost(entity, {
                    lifeTime: 200,
                    tint: 0x00ffff,
                    alpha: 0.4
                });
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
                    ease: 'Back.out'
                });
            }
        });
    }
    //#endregion

    //#region 💀 [사망 & 상태 변화 애니메이션]
    playDeathAnimation(entity, onComplete) {
        if (!this.scene || !entity || !entity.sprite) {
            if (onComplete) onComplete();
            return;
        }

        const sprite = entity.sprite;
        this.stopIdleBobbing(entity);
        this.scene.tweens.killTweensOf(sprite);

        if (entity.body) {
            entity.body.setEnable(false);
        }

        sprite.setTint(0xffffff);
        this.scene.cameras.main.shake(150, 0.005);

        const fallAngle = sprite.flipX ? -90 : 90;

        this.scene.tweens.add({
            targets: sprite,
            angle: fallAngle,
            y: -10,
            duration: 300,
            ease: 'Cubic.in',
            onStart: () => {
                sprite.setTint(0x666666);
            },
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
     * 유닛 아이들 바빙 애니메이션 (Idle Bobbing)
     */
    playIdleBobbing(entity, className) {
        if (!this.scene || !entity || !entity.sprite || entity.idleBobbingTween) return;

        let amplitude = -4;
        let baseDuration = 1000;

        if (className === 'warrior') {
            baseDuration = 1100;
        } else if (className === 'archer') {
            baseDuration = 900;
        }

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
     * 아이들 바빙 애니메이션 중지
     */
    stopIdleBobbing(entity) {
        if (entity.idleBobbingTween) {
            entity.idleBobbingTween.stop();
            entity.idleBobbingTween = null;

            this.scene.tweens.add({
                targets: entity.sprite,
                y: 0,
                duration: 200,
                ease: 'Cubic.out'
            });
        }
    }
    //#endregion
}

const animationManager = new AnimationManager();
export default animationManager;
