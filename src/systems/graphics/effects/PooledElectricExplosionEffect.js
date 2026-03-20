import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';
import layerManager from '../../../ui/LayerManager.js';

/**
 * 전기 폭발 효과 (Pooled Electric Explosion Effect)
 */
class ElectricExplosionSprite extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'electric_explosion_effect');
        this.setOrigin(0.5, 0.5);
        scene.add.existing(this);
    }

    show(x, y) {
        this.setPosition(x, y);
        this.setVisible(true);
        this.setActive(true);
        this.setAlpha(1);
        this.setScale(0.5);
        
        layerManager.assignToLayer(this, 'fx');
        
        // 폭발 애니메이션 (Scale + Alpha)
        this.scene.tweens.add({
            targets: this,
            scale: 2.2,
            alpha: 0,
            duration: 400,
            ease: 'Cubic.out',
            onComplete: () => this.release()
        });
        
        // 살짝 회전
        this.rotation = Math.random() * Math.PI * 2;
    }

    release() {
        this.setVisible(false);
        this.setActive(false);
        poolingManager.release('electric_explosion_effect', this);
    }
}

class PooledElectricExplosionEffect {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        poolingManager.registerPool('electric_explosion_effect', () => new ElectricExplosionSprite(this.scene), 5);
    }

    spawn(x, y) {
        const effect = poolingManager.get('electric_explosion_effect');
        if (effect) {
            effect.show(x, y);
        }
    }
}

const pooledElectricExplosionEffect = new PooledElectricExplosionEffect();
export default pooledElectricExplosionEffect;
