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
        
        // [FIX] 실종 방지: 컨테이너와 스프라이트 가시성 모두 복구
        entity.setVisible(true);
        entity.sprite.setVisible(true);
        
        // 초기 상태 설정 (바닥에서 솟아오를 준비)
        entity.sprite.setAlpha(0);
        entity.sprite.setScale(config.displayScale, 0.1);
        entity.sprite.setY(20);

        // [ENHANCED] 솟구치기 연출 (Bounce Out 효과로 역동성 부여)
        scene.tweens.add({
            targets: entity.sprite,
            scaleY: config.displayScale,
            y: 0,
            alpha: 1,
            duration: duration,
            ease: 'Back.easeOut',
            onComplete: () => {
                // 최종 상태 강제 동기화 (안전장치)
                entity.sprite.setAlpha(1);
                entity.sprite.setScale(config.displayScale);
                entity.sprite.setY(0);
                
                if (onComplete) onComplete();
            }
        });
    }
}
