import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 소환/강화 이펙트 풀링 (PooledSummonEffect)
 */
export default class PooledSummonEffect {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, 'summon_guardian_angel_effect');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens = [];
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {object} options { scale, alpha, duration, tint }
     */
    show(x, y, options = {}) {
        if (!this.scene) return;

        const scale = options.scale || 2.5;
        const alpha = options.alpha !== undefined ? options.alpha : 1.0;
        const duration = options.duration || 1000;
        const tint = options.tint || 0xffffff;

        this.sprite.setPosition(x, y);
        this.sprite.setScale(0.1);
        this.sprite.setAlpha(alpha);
        this.sprite.setTint(tint);
        this.sprite.setVisible(true);

        this.clearTweens();

        const t = this.scene.tweens.add({
            targets: this.sprite,
            scale: scale,
            alpha: 0,
            duration: duration,
            ease: 'Quint.out',
            onComplete: () => {
                poolingManager.release('summon_guardian_angel_fx', this);
            }
        });

        this.tweens.push(t);
    }

    clearTweens() {
        this.tweens.forEach(t => t.stop());
        this.tweens = [];
    }

    onAcquire() {
        this.sprite.setVisible(true);
    }

    onRelease() {
        this.sprite.setVisible(false);
        this.clearTweens();
    }
}
