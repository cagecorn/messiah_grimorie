import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 아이스스톰 구름 풀 대기 객체 (PooledIceStormCloud)
 * 역할: [구름의 시각적인 파티클/효과 레이어]
 */
export default class PooledIceStormCloud {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, 'ice_storm_cloud');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.SCREEN);
        this.tweens = [];
    }

    show(x, y, config = {}) {
        if (!this.scene) return;

        const duration = config.duration || 10000;
        
        this.sprite.setPosition(x, y);
        this.sprite.setScale(0.8);
        this.sprite.setAlpha(0);
        this.sprite.setVisible(true);
        this.sprite.setDepth(1900); // 메인 구름 보다는 아래

        this.clearTweens();

        // 나타나는 효과
        const fadeIn = this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.4,
            scale: 1.8,
            duration: 1000,
            ease: 'Quad.easeOut'
        });
        this.tweens.push(fadeIn);

        // 지속 시간 후 사라짐
        this.scene.time.delayedCall(duration - 1000, () => {
            const fadeOut = this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    poolingManager.release('ice_storm_cloud_fx', this);
                }
            });
            this.tweens.push(fadeOut);
        });
    }

    onAcquire() {
        this.sprite.setVisible(true);
    }

    onRelease() {
        this.sprite.setVisible(false);
        this.clearTweens();
    }

    clearTweens() {
        this.tweens.forEach(t => { t.stop(); });
        this.tweens = [];
    }
}
