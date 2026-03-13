import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import poolingManager from '../../core/PoolingManager.js';

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
        this.sprite.setPosition(target.x, target.y - 40);
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
        const effect = poolingManager.get('impact_effect');
        if (effect) {
            effect.show(target, key);
            
            // 일정 시간 후 풀에 반환 (PooledHitEffect.onRelease가 이미 수행됨을 가정하거나 여기서 직접 호출)
            this.scene.time.delayedCall(300, () => {
                poolingManager.release('impact_effect', effect);
            });
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
        trajectory.setAlpha(0.9);
        trajectory.setDepth(entity.depth - 1); // 유닛 밑에
        
        // [신규] 가로 길이만 압축 (Horizontal Distortion)
        // 비례로 작아지면 너무 작아 보이므로, 세로 높이는 고정(320px)하고 가로만 거리에 맞춰 압축/왜곡함.
        trajectory.setDisplaySize(dist, 320); 

        // 2. 잔상 생성 (Ghosting)
        const ghostTimer = this.scene.time.addEvent({
            delay: 20, // 더 촘촘하게
            repeat: Math.floor(dist / 25),
            callback: () => {
                if (!entity.active || !entity.sprite) return;
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
            }
        });

        // [신규] 유닛 스트레칭 (속도감 강조)
        const originalScaleX = entity.sprite.scaleX;
        entity.sprite.scaleX = originalScaleX * 1.5; // 돌진 방향으로 늘리기

        // 3. 실제 위치 이동 (Container 이동) - 속도 대폭 향상 (180ms)
        this.scene.tweens.add({
            targets: entity,
            x: targetPos.x,
            y: targetPos.y,
            duration: 180,
            ease: 'Cubic.out',
            onComplete: () => {
                // 스케일 복구
                entity.sprite.scaleX = originalScaleX;

                // 궤적 제거 (빠르게 사라짐)
                this.scene.tweens.add({
                    targets: trajectory,
                    alpha: 0,
                    duration: 150,
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
}

const animationManager = new AnimationManager();
export default animationManager;
