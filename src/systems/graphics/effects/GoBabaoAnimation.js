import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';
import ghostManager from '../GhostManager.js';

/**
 * 바바오 궁극기 애니메이션 제어 (Go Babao Animation)
 * 역할: [바바오의 360도 회전 및 특수 시각 효과 관리]
 */
class GoBabaoAnimation {
    /**
     * 바바오 스프라이트를 팽이처럼 회전시킵니다.
     * @param {Phaser.GameObjects.GameObject} target 바바오 엔티티 또는 스프라이트
     */
    static startSpin(scene, target) {
        if (!target) return null;

        const sprite = target.sprite || target;
        
        const baseScaleX = sprite.scaleX;
        sprite.setAngle(0); // 회전 초기화
        
        // 페이퍼돌(Paper Doll) 스타일의 180도 좌우 반전 트윈
        const spinTween = scene.tweens.add({
            targets: sprite,
            scaleX: -baseScaleX,
            duration: 80, // 매우 빠른 반전 (초당 약 12회)
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        });

        return spinTween;
    }

    /**
     * 회전 중 잔상 생성 (Projectile.onUpdate에서 호출 권장)
     */
    static playGhosting(target, options = {}) {
        const { tint = 0x00ffff, alpha = 0.5, lifeTime = 300 } = options;
        ghostManager.spawnGhost(target, { tint, alpha, lifeTime });
    }
}

export default GoBabaoAnimation;
