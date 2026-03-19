import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';
import layerManager from '../../../ui/LayerManager.js';

/**
 * 스마이트 번개 효과 (Pooled Smite Effect)
 * 역할: [하늘에서 적에게 내리치는 거대한 번개 기둥 연출]
 */
class SmiteSprite extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'smite_effect');
        this.setOrigin(0.5, 1); // 발밑 기준
        scene.add.existing(this); // [FIX] 씬의 디스플레이 리스트에 추가
    }

    show(x, y) {
        this.setPosition(x, y);
        this.setVisible(true);
        this.setActive(true);
        
        // [FIX] FX 레이어에 명시적 재할당
        layerManager.assignToLayer(this, 'fx');
        
        // 하늘에서 떨어지는 연출을 위해 Y축 스케일 애니메이션 (더 거대하게)
        this.setScale(2.5, 0);
        this.alpha = 0;
        
        this.scene.tweens.add({
            targets: this,
            scaleY: 3.5,
            alpha: 1,
            duration: 150,
            ease: 'Expo.out',
            onComplete: () => {
                // 잔상 효과 유지를 위해 살짝 대기 후 소멸
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: 400,
                    delay: 200,
                    onComplete: () => this.release()
                });
            }
        });
    }

    release() {
        this.setVisible(false);
        this.setActive(false);
        poolingManager.release('smite_effect', this);
    }
}

class PooledSmiteEffect {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        poolingManager.registerPool('smite_effect', () => new SmiteSprite(this.scene), 5);
    }

    spawn(x, y) {
        const effect = poolingManager.get('smite_effect');
        if (effect) {
            effect.show(x, y);
        }
    }
}

const pooledSmiteEffect = new PooledSmiteEffect();
export default pooledSmiteEffect;
