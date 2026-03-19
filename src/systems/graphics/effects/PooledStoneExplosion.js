import Phaser from 'phaser';

/**
 * 풀링된 석벽 폭발 이펙트 (Pooled Stone Explosion Effect)
 * 역할: [스톤 블래스트 충돌 시 바위 파편 파열 연출]
 * 
 * 연출:
 * - 지면과 충돌하거나 적 타격 시 바위 조각들이 사방으로 튀는 애니메이션
 * - 0.8 ~ 1.5 스케일로 랜덤화된 레이어 중첩
 */
export default class PooledStoneExplosion {
    constructor(scene) {
        this.scene = scene;
        this.layers = [];
        this.layerCount = 3; // 3겹 레이어

        for (let i = 0; i < this.layerCount; i++) {
            const sprite = scene.add.sprite(0, 0, 'stone_explosion_effect');
            sprite.setOrigin(0.5, 0.5);
            // 바위 폭발은 불/물과 달리 기본 블렌드 모드(스크린 등도 가능하지만 일반 Alpha가 무난)
            // 혹은 색감이 강하다면 ADD 사용 가능. 여기서는 바위 파편이므로 일반 Alpha
            // 하지만 화염 이펙트가 포함되어 있으므로 ADD나 SCREEN도 고려 가능. 
            // 원본 이미지에 화염이 섞여있으므로 ADD가 화려함.
            sprite.setBlendMode(Phaser.BlendModes.NORMAL); 
            sprite.setVisible(false);
            sprite.setActive(false);
            this.layers.push(sprite);
        }
    }

    /**
     * 폭발 연출 시작
     * @param {number} x 
     * @param {number} y 
     * @param {object} config { scale, alpha, duration }
     */
    show(x, y, config = {}) {
        const baseScale = config.scale || 1.2;
        const baseAlpha = config.alpha || 1.0;
        const duration = config.duration || 600;

        this.layers.forEach((sprite, index) => {
            // 시차를 두고 순차적 등장
            this.scene.time.delayedCall(index * 60, () => {
                sprite.setPosition(x, y);
                sprite.setScale(0.4 * baseScale);
                sprite.setAlpha(baseAlpha);
                sprite.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
                sprite.setVisible(true);
                sprite.setActive(true);

                // 연출: 빠르게 커지면서 서서히 사라짐
                this.scene.tweens.add({
                    targets: sprite,
                    scale: (1.2 + index * 0.3) * baseScale,
                    alpha: 0,
                    duration: duration + index * 100,
                    ease: 'Cubic.out',
                    onComplete: () => {
                        sprite.setVisible(false);
                        sprite.setActive(false);
                    }
                });
            });
        });
    }

    isActive() {
        return this.layers.some(l => l.active);
    }

    destroy() {
        this.layers.forEach(l => l.destroy());
        this.layers = [];
    }
}
