import Phaser from 'phaser';

/**
 * 침식 애니메이션 (Sinking Animation)
 * 역할: [유닛이 그림자 속으로 가라앉거나 다시 나타나는 연출]
 */
export default class SinkingAnimation {
    constructor(manager) {
        this.manager = manager;
    }

    /**
     * 그림자 속으로 가라앉기
     */
    playSinking(entity, duration = 500, onComplete) {
        if (!entity || !entity.sprite) return;

        const scene = this.manager.scene;
        
        // 1. 이미 진행 중인 트윈 중단
        scene.tweens.killTweensOf(entity.sprite);

        // 2. 가라앉기 연출 (ScaleY 축소 + Y 이동)
        scene.tweens.add({
            targets: entity.sprite,
            scaleY: 0.1,
            y: 20,
            alpha: 0.2,
            duration: duration,
            ease: 'Back.getIn(2)',
            onComplete: () => {
                entity.setVisible(false);
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * 그림자에서 튀어나오기
     */
    playEmerging(entity, duration = 400, onComplete) {
        if (!entity || !entity.sprite) return;

        const scene = this.manager.scene;
        const config = entity.getEntityConfig();
        
        entity.setVisible(true);
        entity.sprite.setAlpha(0);
        entity.sprite.setScale(config.displayScale, 0.1);
        entity.sprite.y = 20;

        // 솟구치기 연출
        scene.tweens.add({
            targets: entity.sprite,
            scaleY: config.displayScale,
            y: 0,
            alpha: 1,
            duration: duration,
            ease: 'Back.getOut(2)',
            onComplete: () => {
                if (onComplete) onComplete();
            }
        });
    }
}
