import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 피격 이펙트 풀링 (PooledHitEffect)
 */
export default class PooledHitEffect {
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
        // 고도(zHeight) 반영하여 공중 피격 위치 보정
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
                poolingManager.release('impact_effect', this);
            }
        });
    }

    onAcquire() {
        this.sprite.setVisible(true);
        this.sprite.setAlpha(0.8);
        this.sprite.setScale(0);
    }

    onRelease() {
        this.sprite.setVisible(false);
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
    }
}
