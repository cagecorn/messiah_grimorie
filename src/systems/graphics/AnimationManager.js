import Logger from '../../utils/Logger.js';

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
        Logger.system("AnimationManager: Tactics-style animation system ready.");
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
