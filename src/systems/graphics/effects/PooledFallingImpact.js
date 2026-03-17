import Phaser from 'phaser';

/**
 * 풀링된 낙하 충격 이효과 (Pooled Falling Impact Effect)
 * 역할: [던져진 몬스터가 착지할 때 발생하는 강력한 충격파 연출]
 */
export default class PooledFallingImpact {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.sprite(0, 0, 'falling_impact_effect');
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);
        this.sprite.setVisible(false);
        this.sprite.setActive(false);
    }

    /**
     * 연출 시작
     * @param {number} x 
     * @param {number} y 
     */
    show(x, y) {
        this.sprite.setPosition(x, y);
        this.sprite.setScale(0.1);
        this.sprite.setAlpha(1.0);
        this.sprite.setVisible(true);
        this.sprite.setActive(true);

        // 연출: 빠르게 커지면서 서서히 사라짐
        this.scene.tweens.add({
            targets: this.sprite,
            scale: 2.5,
            alpha: 0,
            duration: 600,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.sprite.setVisible(false);
                this.sprite.setActive(false);
            }
        });
    }

    isActive() {
        return this.sprite.active;
    }

    destroy() {
        this.sprite.destroy();
    }
}
