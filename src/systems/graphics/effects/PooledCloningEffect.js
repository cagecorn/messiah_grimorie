import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 분신술 효과 (Cloning Effect)
 * 역할: [자인 주위를 감싸는 보라색 연기 연출]
 */
export default class PooledCloningEffect extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'cloning_effect');
        this.scene = scene;
        this.setVisible(false);
        this.scene.add.existing(this);
    }

    /**
     * 효과 표시
     * @param {number} x 
     * @param {number} y 
     * @param {number} duration 
     */
    show(x, y, duration = 800) {
        this.setPosition(x, y);
        this.setAlpha(0);
        this.setScale(0.5);
        this.setVisible(true);
        this.setDepth(100); // 유닛보다 위

        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            scale: 1.2,
            rotation: Phaser.Math.DegToRad(360),
            duration: duration / 2,
            yoyo: true,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.setVisible(false);
                poolingManager.release('cloning_effect', this);
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
