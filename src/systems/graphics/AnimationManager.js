import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import poolingManager from '../../core/PoolingManager.js';
import phaserParticleManager from './PhaserParticleManager.js';

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
                this.onRelease();
            }
        });
    }

    onAcquire() {
        // 획득 시 특별한 처리 없음
    }

    onRelease() {
        this.sprite.setVisible(false);
        if (this.tween) this.tween.stop();
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
        
        // [신규] 피격 이펙트 풀 등록 (초기 20개 확보)
        poolingManager.registerPool('impact_effect', () => new PooledHitEffect(this.scene), 20);
        
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
                this.scene.time.delayedCall(300, () => poolingManager.release('impact_effect', effect1));
            }
            
            // 약간의 딜레이와 함께 두 번째 이펙트 오버랩
            this.scene.time.delayedCall(50, () => {
                const effect2 = poolingManager.get('impact_effect');
                if (effect2) {
                    effect2.show(target, 'impact_phys_2');
                    this.scene.time.delayedCall(300, () => poolingManager.release('impact_effect', effect2));
                }
            });
        } else {
            const effect = poolingManager.get('impact_effect');
            if (effect) {
                effect.show(target, key);
                this.scene.time.delayedCall(300, () => poolingManager.release('impact_effect', effect));
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

        const trajectory = this.scene.add.image(entity.x, entity.y, 'charge_attack');
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
                
                // 잔상 생성
                const ghost = this.scene.add.sprite(entity.x + entity.sprite.x, entity.y + entity.sprite.y, entity.sprite.texture.key);
                ghost.setFlipX(entity.sprite.flipX);
                ghost.setScale(entity.sprite.scaleX, entity.sprite.scaleY);
                ghost.setAlpha(0.6);
                ghost.setTint(0x00ffff);
                this.scene.tweens.add({
                    targets: ghost,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => ghost.destroy()
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
                    onComplete: () => trajectory.destroy()
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
        // 대쉬 중에 일정 간격으로 유닛의 잔상을 남깁니다.
        const spawnGhost = () => {
            if (!entity.active || !entity.sprite) return;

            // 현재 스프라이트 상태 복제
            const ghost = this.scene.add.sprite(entity.x + entity.sprite.x, entity.y + entity.sprite.y, entity.sprite.texture.key);
            ghost.setFlipX(entity.sprite.flipX);
            ghost.setScale(entity.sprite.scaleX, entity.sprite.scaleY);
            ghost.setOrigin(entity.sprite.originX, entity.sprite.originY);
            ghost.setAlpha(0.4);
            ghost.setDepth(entity.depth - 0.01); // 유닛보다 살짝 뒤에

            // 잔상 소멸 애니메이션
            this.scene.tweens.add({
                targets: ghost,
                alpha: 0,
                duration: 200,
                ease: 'Power1',
                onComplete: () => ghost.destroy()
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

    /**
     * 유닛 사망 애니메이션 (Death Animation)
     * [충격 -> 쓰러짐 -> 소멸] 과정을 단계별 트윈으로 연출
     */
    playDeathAnimation(entity, onComplete) {
        if (!this.scene || !entity || !entity.sprite) return;

        // 1. 충격 페이즈: 하얗게 번쩍임
        entity.sprite.setTint(0xffffff);
        this.scene.cameras.main.shake(150, 0.005);

        // 2. 쓰러짐 & 가라앉음 페이즈
        // 방향에 따라 쓰러지는 각도 조절
        const fallAngle = entity.sprite.flipX ? -90 : 90;

        this.scene.tweens.add({
            targets: entity.sprite,
            angle: fallAngle,
            y: 40, // 바닥으로 가라앉는 느낌
            duration: 600,
            ease: 'Cubic.in',
            delay: 100, // 충격 직후 잠시 멈춤
            onStart: () => {
                // 서서히 어둡게 (시체 느낌)
                entity.sprite.setTint(0x444444);
            },
            onComplete: () => {
                // 3. 소멸 & 영혼 승천 페이즈
                if (phaserParticleManager.spawnSoul) {
                    phaserParticleManager.spawnSoul(entity.x, entity.y - 20);
                }

                this.scene.tweens.add({
                    targets: entity,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        if (onComplete) onComplete();
                    }
                });
            }
        });
    }
}

const animationManager = new AnimationManager();
export default animationManager;
