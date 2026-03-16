import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 발도술 효과 (Battō-jutsu Effect)
 * 역할: [리아 주위를 감싸는 날카로운 검기 소용돌이 연출]
 */
export default class PooledBattoJutsuEffect extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'battojutsu_effect');
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
    show(x, y, duration = 1000) {
        this.setPosition(x, y);
        this.setAlpha(0);
        this.setScale(0.3);
        this.setVisible(true);
        this.setDepth(100); // 유닛보다 위
        this.setBlendMode(Phaser.BlendModes.ADD);

        // 강렬한 회전과 함께 나타났다 사라짐
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 0, to: 1 },
            scale: 1.5,
            rotation: Phaser.Math.DegToRad(720),
            duration: duration * 0.4,
            ease: 'Expo.out',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    scale: 2.0,
                    rotation: Phaser.Math.DegToRad(1080),
                    duration: duration * 0.6,
                    ease: 'Power2',
                    onComplete: () => {
                        this.setVisible(false);
                        poolingManager.release('battojutsu_effect', this);
                    }
                });
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
