import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 아쿠아 폭발 효과 풀링 (PooledAquaExplosion)
 * 역할: [아쿠아 버스트 명중 시 물빛 폭발 연출]
 */
export default class PooledAquaExplosion {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, 'aqua_explosion_effect');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens = [];
    }

    show(x, y) {
        if (!this.scene) return;

        this.sprite.setPosition(x, y);
        this.sprite.setScale(0.2);
        this.sprite.setAlpha(1.0);
        this.sprite.setVisible(true);
        this.sprite.setDepth(1000); // 상단 노출

        this.clearTweens();

        // 여러 겹의 확산 연출 (임시로 하나만 하되, AnimationManager에서 여러번 호출 가능)
        const t1 = this.scene.tweens.add({
            targets: this.sprite,
            scale: { from: 0.2, to: 1.5 },
            alpha: { from: 1.0, to: 0 },
            duration: 600,
            ease: 'Back.out',
            onComplete: () => {
                poolingManager.release('aqua_explosion_fx', this);
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
