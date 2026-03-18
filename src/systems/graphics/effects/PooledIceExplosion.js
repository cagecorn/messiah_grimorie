import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 아이스 폭발 효과 풀링 (PooledIceExplosion)
 * 역할: [아이스볼 명중 시 얼음 파편 폭발 연출]
 * 
 * 🦖 거대한 갓 오브젝트를 길들이는 꼼수 준수:
 * 1. 풀링 필수 (PoolingManager 연동)
 */
export default class PooledIceExplosion {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, 'ice_explosion_effect');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens = [];
    }

    show(x, y, config = {}) {
        if (!this.scene) return;

        const scale = config.scale || 1.0;
        const duration = config.duration || 500;

        this.sprite.setPosition(x, y);
        this.sprite.setScale(0.1 * scale);
        this.sprite.setAlpha(1.0);
        this.sprite.setAngle(Math.random() * 360);
        this.sprite.setVisible(true);
        this.sprite.setDepth(1001); // FX 레이어 상단

        this.clearTweens();

        // 얼음 폭발 애니메이션: 급격히 커지며 사라짐
        const t1 = this.scene.tweens.add({
            targets: this.sprite,
            scale: { from: 0.1 * scale, to: 1.2 * scale },
            alpha: { from: 1.0, to: 0 },
            angle: '+=45',
            duration: duration,
            ease: 'Back.out',
            onComplete: () => {
                poolingManager.release('ice_explosion_fx', this);
            }
        });
        this.tweens.push(t1);
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
