import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 파이어 폭발 효과 풀링 (PooledFireExplosion)
 * 역할: [파이어 버스트 명중 시 불꽃 폭발 연출]
 * 
 * 🦖 거대한 갓 오브젝트를 길들이는 꼼수 준수:
 * 1. 풀링 필수 (PoolingManager 연동)
 */
export default class PooledFireExplosion {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, 'fire_explosion_effect');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens = [];
    }

    show(x, y, config = {}) {
        if (!this.scene) return;

        const scale = config.scale || 1.0;
        const duration = config.duration || 600;

        this.sprite.setPosition(x, y);
        this.sprite.setScale(0.2 * scale);
        this.sprite.setAlpha(1.0);
        this.sprite.setAngle(Math.random() * 360);
        this.sprite.setVisible(true);
        this.sprite.setDepth(1000); // 상단 노출

        this.clearTweens();

        const t1 = this.scene.tweens.add({
            targets: this.sprite,
            scale: { from: 0.2 * scale, to: 1.8 * scale },
            alpha: { from: 1.0, to: 0 },
            angle: '+=90',
            duration: duration,
            ease: 'Cubic.out',
            onComplete: () => {
                poolingManager.release('fire_explosion_fx', this);
            }
        });
        this.tweens.push(t1);

        // 중앙 플래시 추가 연출 (선택)
        if (config.showFlash) {
            // 필요 시 추가 연출 가능
        }
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
