import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import poolingManager from '../../core/PoolingManager.js';
import phaserParticleManager from './PhaserParticleManager.js';
import ghostManager from './GhostManager.js';

// ==========================================
// 💥 [구역 1] 피격 이펙트 풀링 (PooledHitEffect)
// ==========================================
class PooledHitEffect {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, 'impact_phys_1');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);
        this.tween = null;
    }

    show(target, key) {
        if (!this.scene || !target || !target.active) return;

        // 상태 초기화
        this.sprite.setTexture(key);
        // [FIX] 고도(zHeight) 반영하여 공중 피격 위치 보정
        const hitY = target.zHeight ? (target.y - target.zHeight - 40) : (target.y - 40);
        this.sprite.setPosition(target.x, hitY);
        this.sprite.setScale(0);
        this.sprite.setAlpha(0.8);
        this.sprite.setDepth(target.depth + 0.1);
        this.sprite.setVisible(true);

        const baseScale = target.sprite.scaleX * 0.35;

        if (this.tween) this.tween.stop();
        this.tween = this.scene.tweens.add({
            targets: this.sprite,
            scale: baseScale * 1.2,
            alpha: 0,
            duration: 250,
            ease: 'Back.out',
            onComplete: () => {
                poolingManager.release('impact_effect', this);
            }
        });
    }

    onAcquire() {
        this.sprite.setVisible(true);
        this.sprite.setAlpha(0.8);
        this.sprite.setScale(0);
    }

    onRelease() {
        this.sprite.setVisible(false);
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
    }
}

// ==========================================
// ✨ [구역 2] 스킬 이펙트 풀링 (PooledSkillEffect)
// ==========================================
class PooledSkillEffect {
    constructor(scene, textureKey) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, textureKey);
        this.sprite.setVisible(false);
        this.tween = null;
    }

    onAcquire() {
        this.sprite.setVisible(true);
        this.sprite.setAlpha(1);
        this.sprite.setScale(1);
    }

    onRelease() {
        this.sprite.setVisible(false);
        if (this.tween) {
            this.scene.tweens.killTweensOf(this.sprite);
            this.tween = null;
        }
    }
}

/**
 * 애니메이션 매니저 (Animation Manager)
 * 역할: [유닛의 역동적인 연출 로직 담당]
 * 
 * 특징:
 * 1. Dash Attack: 타겟 방향으로 전진했다가 복귀
 * 2. Motion Blur: 고속 이동 시 BlurManager 연동
 */
class AnimationManager {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;

        // [신규] 피격 이펙트 풀 등록 (초기 50개로 상향 - 대규모 전투 대비)
        poolingManager.registerPool('impact_effect', () => new PooledHitEffect(this.scene), 50);

        // [USER 요청] 차지 어택 및 궁극기 기둥 효과 풀링
        poolingManager.registerPool('charge_attack_fx', () => new PooledSkillEffect(this.scene, 'charge_attack'), 5);
        poolingManager.registerPool('for_messiah_pillar', () => new PooledSkillEffect(this.scene, 'for_messiah'), 3);

        Logger.system("AnimationManager: Tactics-style animation system ready.");
    }

    /**
     * 피격 이펙트 애니메이션 (Impact Effect)
     * @param {CombatEntity} target 피격 유닛
     * @param {string} type 데미지 타입
     */
    playHitEffect(target, type = 'physical') {
        if (!this.scene || !target || !target.active) return;

        // 1. 에셋 키 결정
        let key = '';
        if (type === 'physical') {
            key = Math.random() < 0.5 ? 'impact_phys_1' : 'impact_phys_2';
        } else {
            return;
        }

        // 2. 풀에서 이펙트 객체 획득 및 실행
        // [요청] 물리 속성일 경우 두 개의 임팩트를 겹쳐서(Overlap) 출력하여 강렬함 전달
        if (type === 'physical') {
            const effect1 = poolingManager.get('impact_effect');
            if (effect1) {
                effect1.show(target, 'impact_phys_1');
            }

            // 약간의 딜레이와 함께 두 번째 이펙트 오버랩
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
     * @param {CombatEntity} entity 시전자
     * @param {object} targetPos 목표 위치 { x, y }
     * @param {Function} onComplete 도착 시점 콜백 (AOE 등)
     */
    playSkillDash(entity, targetPos, onComplete) {
        if (!this.scene || !entity || !targetPos) return;

        // 0. 돌진 전 미세한 파워 업 임팩트 (화면 흔들림)
        this.scene.cameras.main.shake(100, 0.003);

        // 1. 궤적 이미지 생성 (charge_attack.png)
        const dx = targetPos.x - entity.x;
        const dy = targetPos.y - entity.y;
        const angle = Math.atan2(dy, dx);
        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, targetPos.x, targetPos.y);

        // [USER 요청] 풀링된 궤적 이미지 사용
        const pooledFx = poolingManager.get('charge_attack_fx');
        const trajectory = pooledFx.sprite;

        trajectory.setPosition(entity.x, entity.y);
        trajectory.setOrigin(0, 0.5); // 시작점 기준
        trajectory.setRotation(angle);
        trajectory.setAlpha(1.0); // 초기 알파값 강화
        trajectory.setBlendMode(Phaser.BlendModes.ADD); // [신규] 빛 효과 추가
        trajectory.setDepth(entity.depth - 1); // 유닛 밑에

        // [신규] 가로 길이만 압축 (Horizontal Distortion)
        trajectory.setDisplaySize(dist, 320);

        // [신규] 유닛 스트레칭 (속도감 강조)
        const originalScaleX = entity.sprite.scaleX;
        entity.sprite.scaleX = originalScaleX * 1.5;

        // 2. 잔상 생성 (Ghosting) + 먼지 트레일
        const ghostTimer = this.scene.time.addEvent({
            delay: 20,
            repeat: Math.floor(dist / 25),
            callback: () => {
                if (!entity.active || !entity.sprite) return;

                // [신규] GhostManager 연동 잔상 생성
                ghostManager.spawnGhost(entity, {
                    lifeTime: 300,
                    tint: 0x00ffff,
                    alpha: 0.6
                });

                // 먼지 트레일 (바닥에 먼지가 일어나는 연출)
                if (phaserParticleManager.spawnWhiteDust) {
                    phaserParticleManager.spawnWhiteDust(entity.x, entity.y);
                }
            }
        });


        // 4. 실제 위치 이동 (Container 이동)
        this.scene.tweens.add({
            targets: entity,
            x: targetPos.x,
            y: targetPos.y,
            duration: 180,
            ease: 'Cubic.out',
            onComplete: () => {
                // 스케일 복구
                entity.sprite.scaleX = originalScaleX;
                if (ghostTimer) ghostTimer.remove();

                // 궤적 제거 (체감 시간 연장을 위해 400ms로 상향)
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
     * @param {CombatEntity} entity 공격자
     * @param {CombatEntity} target 피격자
     * @param {Function} onHit 임팩트 시점 콜백
     */
    playDashAttack(entity, target, onHit) {
        if (!this.scene || !entity || !target || !entity.sprite) return;

        // [핵심] 컨테이너가 아닌 스프라이트만 움직여서 물리 간섭 방지
        const dx = target.x - entity.x;
        const dy = target.y - entity.y;
        const dashX = dx * 0.4;
        const dashY = dy * 0.4;

        // [신규] 고퀄리티 모션 블러 (Ghosting / Afterimage)
        // 대쉬 중에 일정 간격으로 유닛의 잔상을 남깁니다. (GhostManager 연동)
        const spawnGhost = () => {
            if (!entity.active || !entity.sprite) return;

            ghostManager.spawnGhost(entity, {
                lifeTime: 200,
                tint: 0x00ffff,
                alpha: 0.4
            });
        };

        // 잔상 생성 타이머 (100ms 대쉬 동안 3-4번 생성)
        const ghostTimer = this.scene.time.addEvent({
            delay: 20,
            repeat: 4,
            callback: spawnGhost
        });

        // 1. 대쉬 전진
        this.scene.tweens.add({
            targets: entity.sprite,
            x: dashX,
            y: dashY,
            duration: 100,
            ease: 'Cubic.out',
            onComplete: () => {
                // 2. 임팩트 시점
                if (onHit) onHit();

                // 3. 복귀
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

    playDeathAnimation(entity, onComplete) {
        if (!this.scene || !entity || !entity.sprite) {
            if (onComplete) onComplete();
            return;
        }

        const sprite = entity.sprite;

        // [USER 요청] 택티컬 콜랩스 프리미엄 연출 복구
        this.stopIdleBobbing(entity);
        this.scene.tweens.killTweensOf(sprite);

        // [신규] 물리 엔진 즉시 비활성화 (죽는 도중 피격/간섭 방지)
        if (entity.body) {
            entity.body.setEnable(false);
        }

        // 1. 충격 페이즈: 하얗게 번쩍임 + 카메라 흔들림
        sprite.setTint(0xffffff);
        this.scene.cameras.main.shake(150, 0.005);

        // 2. 쓰러짐 & 바운스 페이즈
        const fallAngle = sprite.flipX ? -90 : 90;

        // [USER 요청] 1단계: 쓰러지면서 지면에 충돌
        this.scene.tweens.add({
            targets: sprite,
            angle: fallAngle,
            y: -10, // 쓰러질 때 머리가 들리는 느낌을 위해 아주 살짝 위로 (Origin 보정)
            duration: 300,
            ease: 'Cubic.in',
            onStart: () => {
                sprite.setTint(0x666666); // 살짝 어둡게
            },
            onComplete: () => {
                // 2단계: 지면 반동 (Bounce)
                this.scene.tweens.add({
                    targets: sprite,
                    y: -25, // 한 번 튕겨져 나감
                    duration: 200,
                    ease: 'Cubic.out',
                    yoyo: true, // 다시 바닥으로
                    onComplete: () => {
                        // 3단계: 최종 안착 및 소멸
                        if (phaserParticleManager.spawnSoul) {
                            const baseY = entity.y - (entity.zHeight || 0);
                            phaserParticleManager.spawnSoul(entity.x, baseY - 20);
                        }

                        this.scene.tweens.add({
                            targets: entity,
                            alpha: 0,
                            duration: 800,
                            delay: 200, // 잠시 안착된 모습을 보여줌
                            onComplete: () => {
                                // 초기화 후 콜백 호출
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
     * [신규] 유닛 아이들 바빙 애니메이션 (Idle Bobbing)
     * 역할: [가만히 있을 때 위아래로 둥둥 떠있는 효과]
     * @param {CombatEntity} entity 
     * @param {string} className 클래스명에 따른 커스텀 바빙 적용
     */
    playIdleBobbing(entity, className) {
        if (!this.scene || !entity || !entity.sprite || entity.idleBobbingTween) return;

        // [USER 요청] 둘의 바빙이 다른 이유: 클래스별 속도 차이가 너무 컸음.
        // 프리셋을 더 좁은 범위로 조정하여 통일성 부여
        let amplitude = -4;      // 발이 땅에서 너무 떨어지지 않게 고정
        let baseDuration = 1000;

        if (className === 'warrior') {
            baseDuration = 1100; // 아주 미세하게 느림
        } else if (className === 'archer') {
            baseDuration = 900;  // 아주 미세하게 빠름
        }

        entity.idleBobbingTween = this.scene.tweens.add({
            targets: entity.sprite,
            y: amplitude,
            duration: baseDuration, // 랜덤성 제거 (통일감 강조)
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * [신규] 아이들 바빙 애니메이션 중지
     */
    stopIdleBobbing(entity) {
        if (entity.idleBobbingTween) {
            entity.idleBobbingTween.stop();
            entity.idleBobbingTween = null;

            // 스프라이트 위치 원복
            this.scene.tweens.add({
                targets: entity.sprite,
                y: 0,
                duration: 200,
                ease: 'Cubic.out'
            });
        }
    }
}

const animationManager = new AnimationManager();
export default animationManager;
