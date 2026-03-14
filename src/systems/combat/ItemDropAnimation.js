/**
 * 아이템 드랍 애니메이션 유틸리티 (Item Drop Animation)
 * 역할: [전리품 연출 로직 모듈화]
 */
export default {
    /**
     * 팝 애니메이션 실행 (LootEntity용)
     */
    playPop(entity, config = {}) {
        const scene = entity.scene;
        const jumpHeight = config.jumpHeight || 60 + Math.random() * 40;
        const scatterX = config.scatterX || (Math.random() - 0.5) * 120;
        const duration = config.duration || 600;

        // 1. 위로 솟구쳤다가 바닥으로 (Bounce)
        scene.tweens.add({
            targets: entity,
            y: entity.y - jumpHeight,
            duration: duration * 0.4,
            ease: 'Cubic.out',
            onComplete: () => {
                scene.tweens.add({
                    targets: entity,
                    y: entity.y + jumpHeight,
                    duration: duration * 0.6,
                    ease: 'Bounce.out'
                });
            }
        });

        // 2. 좌우 분산
        scene.tweens.add({
            targets: entity,
            x: entity.x + scatterX,
            duration: duration,
            ease: 'Linear'
        });

        // 3. 회전
        scene.tweens.add({
            targets: entity,
            angle: 360 * (Math.random() > 0.5 ? 2 : -2),
            duration: duration,
            ease: 'Quad.out'
        });
    }
};
