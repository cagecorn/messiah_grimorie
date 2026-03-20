import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';
import layerManager from '../../../ui/LayerManager.js';

/**
 * 감전 효과 스프라이트 (Pooled Electric Shock Effect)
 * 역할: [감전된 대상의 위치를 추적하며 전기 스파크 연출]
 */
class ElectricShockSprite extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'electric_shock_effect');
        this.setOrigin(0.5, 0.5);
        this.target = null;
        scene.add.existing(this);
    }

    show(target, duration) {
        this.target = target;
        this.duration = duration;
        this.elapsed = 0;
        
        this.setVisible(true);
        this.setActive(true);
        this.setAlpha(1);
        this.setScale(1.2);
        this.setBlendMode(Phaser.BlendModes.ADD);
        
        layerManager.assignToLayer(this, 'fx');
        
        // 깜빡거리는 효과 (전기 스파크 느낌)
        this.blinkTween = this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 50,
            yoyo: true,
            repeat: -1
        });

        // 서서히 커졌다가 작아졌다가 하는 연출
        this.scaleTween = this.scene.tweens.add({
            targets: this,
            scale: 1.5,
            duration: 200,
            yoyo: true,
            repeat: -1
        });
    }

    updateEffect(delta) {
        if (!this.active || !this.target || !this.target.active) {
            this.release();
            return;
        }

        this.elapsed += delta;
        
        // 타겟의 중심 위치 추적 (약간 위쪽)
        this.setPosition(this.target.x, this.target.y - 40);
        this.rotation += 0.2; // 계속 회전

        if (this.elapsed >= this.duration) {
            this.release();
        }
    }

    release() {
        if (this.blinkTween) this.blinkTween.stop();
        if (this.scaleTween) this.scaleTween.stop();
        this.setVisible(false);
        this.setActive(false);
        this.target = null;
        poolingManager.release('electric_shock_effect', this);
    }
}

class PooledElectricShockEffect {
    constructor() {
        this.scene = null;
        this.activeEffects = new Set();
    }

    init(scene) {
        this.scene = scene;
        poolingManager.registerPool('electric_shock_effect', () => new ElectricShockSprite(this.scene), 10);
        this.activeEffects.clear();
    }

    spawn(target, duration) {
        const effect = poolingManager.get('electric_shock_effect');
        if (effect) {
            effect.show(target, duration);
            this.activeEffects.add(effect);
        }
    }

    update(delta) {
        this.activeEffects.forEach(effect => {
            if (effect.active) {
                effect.updateEffect(delta);
            } else {
                this.activeEffects.delete(effect);
            }
        });
    }
}

const pooledElectricShockEffect = new PooledElectricShockEffect();
export default pooledElectricShockEffect;
