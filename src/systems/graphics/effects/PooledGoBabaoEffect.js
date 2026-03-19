import Phaser from 'phaser';
import poolingManager from '../../core/PoolingManager.js';

/**
 * 바바오 전용 잔상 효과 (Pooled Go Babao Effect)
 * 역할: [궁극기 시전 중 빠른 회전 잔상을 효율적으로 관리]
 */
class PooledGoBabaoEffect extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'babao_sprite');
        this.scene = scene;
        this.setVisible(false);
    }

    show(x, y, rotation, scale, alpha = 0.6, lifeTime = 200) {
        this.setPosition(x, y);
        this.setRotation(rotation);
        this.setScale(scale);
        this.setAlpha(alpha);
        this.setTint(0x00ffff); // 바오의 마력 색상 (하늘색 계열)
        this.setVisible(true);
        this.setDepth(10); // 상단 표시

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: scale * 0.8,
            duration: lifeTime,
            onComplete: () => {
                poolingManager.release('go_babao_ghost', this);
            }
        });
    }

    onAcquire() {
        this.setVisible(true);
    }

    onRelease() {
        this.setVisible(false);
        this.scene.tweens.killTweensOf(this);
    }
}

// 초기화 시 풀링 매니저에 등록 필요 (AnimationManager 등에서 수행)
export default PooledGoBabaoEffect;
