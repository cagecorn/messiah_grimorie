import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 매스 힐 써클 풀링 (PooledMassHealCircle)
 */
export default class PooledMassHealCircle {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, 'mass_heal_effect');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);
        this.sprite.setScrollFactor(1); // 월드 좌표 추종
        this.tweens = [];
    }

    /**
     * @param {CombatEntity} owner 시전자
     * @param {object} options { scale, alpha, rotateSpeed, startAngle }
     */
    show(owner, options = {}) {
        if (!this.scene || !owner || !owner.active) return;

        const scale = options.scale || 1.0;
        const alpha = options.alpha || 0.5;
        const rotateSpeed = options.rotateSpeed || 360;
        const startAngle = options.startAngle || 0;

        this.sprite.setPosition(owner.x, owner.y);
        this.sprite.setScale(0.1);
        this.sprite.setAlpha(alpha);
        this.sprite.setAngle(startAngle);
        this.sprite.setDepth(owner.depth - 0.1); 
        this.sprite.setVisible(true);

        this.clearTweens();

        // 1. 확장 및 페이드아웃
        const scaleTween = this.scene.tweens.add({
            targets: this.sprite,
            scale: scale,
            alpha: 0,
            duration: 1500,
            ease: 'Quint.out',
            onComplete: () => {
                poolingManager.release('mass_heal_circle', this);
            }
        });

        // 2. 여러 각도로 회전
        const rotateTween = this.scene.tweens.add({
            targets: this.sprite,
            angle: startAngle + rotateSpeed,
            duration: 1500,
            ease: 'Power2.out'
        });

        this.tweens.push(scaleTween, rotateTween);
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
