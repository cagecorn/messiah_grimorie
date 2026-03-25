import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';
import layerManager from '../../../ui/LayerManager.js';

/**
 * 뮤지컬 매지컬 크리티컬 이펙트 스프라이트 (Musical Magical Critical Effect Sprite)
 */
class MusicalCriticalSprite extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'musical_magical_critical_effect');
        this.setOrigin(0.5, 1.0); // 바닥 기준
        scene.add.existing(this);
    }

    show(x, y, duration = 1200) {
        this.setPosition(x, y);
        this.setVisible(true);
        this.setActive(true);
        this.setAlpha(0);
        this.setScale(1.2);
        
        layerManager.assignToLayer(this, 'fx');
        
        // 연출: 위에서 아래로 내려오며 나타났다가 사라짐
        this.scene.tweens.add({
            targets: this,
            y: y + 20, 
            alpha: { from: 0, to: 0.9 },
            duration: 300,
            ease: 'Back.out',
            onComplete: () => {
                this.scene.time.delayedCall(duration - 600, () => {
                    this.scene.tweens.add({
                        targets: this,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => this.release()
                    });
                });
            }
        });
    }

    release() {
        this.setVisible(false);
        this.setActive(false);
        poolingManager.release('musical_magical_critical_effect', this);
    }
}

class PooledMusicalMagicalCriticalEffect {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        poolingManager.registerPool('musical_magical_critical_effect', () => new MusicalCriticalSprite(this.scene), 3);
    }

    spawn(x, y) {
        const effect = poolingManager.get('musical_magical_critical_effect');
        if (effect) {
            effect.show(x, y);
        }
    }
}

const pooledMusicalMagicalCriticalEffect = new PooledMusicalMagicalCriticalEffect();
export default pooledMusicalMagicalCriticalEffect;
