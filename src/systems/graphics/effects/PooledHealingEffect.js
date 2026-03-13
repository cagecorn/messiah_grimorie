import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 힐링 이펙트 풀링 (PooledHealingEffect)
 */
export default class PooledHealingEffect {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, 'healing_effect');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);
        this.tween = null;
    }

    show(target) {
        if (!this.scene || !target || !target.active) return;

        this.sprite.setPosition(target.x, target.y - 40);
        this.sprite.setScale(0.5);
        this.sprite.setAlpha(0);
        this.sprite.setDepth(target.depth + 1);
        this.sprite.setVisible(true);

        if (this.tween) this.tween.stop();
        this.tween = this.scene.tweens.add({
            targets: this.sprite,
            scale: 1.2,
            alpha: { from: 0.8, to: 0 },
            y: '-=40',
            duration: 800,
            ease: 'Cubic.out',
            onComplete: () => {
                poolingManager.release('healing_effect', this);
            }
        });
    }

    onAcquire() {
        this.sprite.setVisible(true);
    }

    onRelease() {
        this.sprite.setVisible(false);
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
    }
}
