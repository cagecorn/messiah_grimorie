import Phaser from 'phaser';

/**
 * 풀링된 폭발 이펙트 (Pooled Explosion Effect)
 * 역할: [메테오 충돌 시 거대한 폭발 연출]
 * 
 * 연출: 
 * - 여러 개의 스프라이트를 0.5 ~ 3.0+ 스케일로 키우며 겹쳐서 출력
 * - ADD 블렌드 모드 + 시차(Temporal Offset)
 */
export default class PooledExplosion {
    constructor(scene) {
        this.scene = scene;
        this.layers = [];
        this.layerCount = 4; // 4겹 레이어

        for (let i = 0; i < this.layerCount; i++) {
            const sprite = scene.add.sprite(0, 0, 'explosion_effect');
            sprite.setOrigin(0.5, 0.5);
            sprite.setBlendMode(Phaser.BlendModes.ADD);
            sprite.setVisible(false);
            sprite.setActive(false);
            this.layers.push(sprite);
        }
    }

    /**
     * 폭발 연출 시작
     * @param {number} x 
     * @param {number} y 
     * @param {object} config { scale, duration, alpha }
     */
    show(x, y, config = {}) {
        const baseScale = config.scale || 1.5;
        const duration = config.duration || 1000;
        const baseAlpha = config.alpha || 0.8;

        this.layers.forEach((sprite, index) => {
            // 시차를 두고 순차적 등장 (50ms ~ 150ms 간격)
            this.scene.time.delayedCall(index * 80, () => {
                sprite.setPosition(x, y);
                sprite.setScale(0.5 * baseScale);
                sprite.setAlpha(baseAlpha);
                sprite.setVisible(true);
                sprite.setActive(true);

                // 연출: 커지면서 투명해짐 (회전 제외로 담백하게)
                this.scene.tweens.add({
                    targets: sprite,
                    scale: (2.0 + index * 0.4) * baseScale,
                    alpha: 0,
                    duration: duration + index * 150,
                    ease: 'Quad.out',
                    onComplete: () => {
                        sprite.setVisible(false);
                        sprite.setActive(false);
                    }
                });
            });
        });
    }

    // Pooling 시그니처 대응
    isActive() {
        return this.layers.some(l => l.active);
    }

    destroy() {
        this.layers.forEach(l => l.destroy());
        this.layers = [];
    }
}
