import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';
import layerManager from '../../../ui/LayerManager.js';

/**
 * 뮤지컬 매지컬 크리티컬 이펙트 (Musical Magical Critical Effect - Refined)
 * 역할: [레이어드 스프라이트 + ADD 블렌드 + 핑크 파티클]
 */
class MusicalCriticalEffectInstance {
    constructor(scene) {
        this.scene = scene;
        
        // 1. 글로우 레이어 (배경에서 은은하게 빛남)
        this.glow = scene.add.sprite(0, 0, 'musical_magical_critical_effect');
        this.glow.setOrigin(0.5, 1.0);
        this.glow.setTint(0xff00ff); // 핑크/마젠타 틴트
        this.glow.setAlpha(0);
        this.glow.setBlendMode(Phaser.BlendModes.ADD);
        
        // 2. 메인 레이어 (선명한 이미지)
        this.main = scene.add.sprite(0, 0, 'musical_magical_critical_effect');
        this.main.setOrigin(0.5, 1.0);
        this.main.setAlpha(0);
        this.main.setBlendMode(Phaser.BlendModes.ADD);

        // 3. 파티클 이미터
        // [NOTE] 'critical_up' 아이콘이나 별도의 작은 파티클 이미지가 있으면 좋지만, 여기서는 화이트 서클이나 핑 포인트를 가정한 연출
        this.emitter = scene.add.particles(0, 0, 'musical_magical_critical_effect', {
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.6, end: 0 },
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            rotate: { min: 0, max: 360 },
            lifespan: 800,
            blendMode: 'ADD',
            tint: 0xff66cc, // 화사한 핑크
            frequency: -1, // 수동 시작
            gravityY: -100 // 위로 떠오름
        });

        layerManager.assignToLayer(this.glow, 'fx');
        layerManager.assignToLayer(this.main, 'fx');
        layerManager.assignToLayer(this.emitter, 'fx');

        this.isVisible = false;
    }

    show(x, y, duration = 1500) {
        this.isVisible = true;

        // 위치 설정
        this.glow.setPosition(x, y);
        this.main.setPosition(x, y);
        this.emitter.setPosition(x, y - 100); // 기둥 중간쯤에서 뿜어져 나옴

        // 초기화
        this.glow.setVisible(true).setAlpha(0).setScale(1.4);
        this.main.setVisible(true).setAlpha(0).setScale(1.0);
        
        // 핑크 파티클 폭발
        this.emitter.explode(20);

        // 연출 1: 글로우 확장 및 페이드인
        this.scene.tweens.add({
            targets: this.glow,
            alpha: 0.4,
            scale: 1.6,
            duration: 400,
            ease: 'Quad.out'
        });

        // 연출 2: 메인 기둥 등장
        this.scene.tweens.add({
            targets: this.main,
            alpha: { from: 0, to: 1 },
            scaleY: { from: 0.5, to: 1.2 },
            duration: 500,
            ease: 'Back.out',
            onComplete: () => {
                // 부르르 떨리는 효과 추가 (세련미)
                this.scene.tweens.add({
                    targets: [this.main, this.glow],
                    x: x + (Math.random() - 0.5) * 5,
                    duration: 50,
                    yoyo: true,
                    repeat: 5
                });

                // 사라지기 예약
                this.scene.time.delayedCall(duration - 600, () => {
                    this.hide();
                });
            }
        });
    }

    hide() {
        this.scene.tweens.add({
            targets: [this.main, this.glow],
            alpha: 0,
            scaleX: 0,
            duration: 400,
            onComplete: () => {
                this.glow.setVisible(false);
                this.main.setVisible(false);
                this.isVisible = false;
                poolingManager.release('musical_magical_critical_effect', this);
            }
        });
    }
}

class PooledMusicalMagicalCriticalEffect {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        poolingManager.registerPool('musical_magical_critical_effect', () => new MusicalCriticalEffectInstance(this.scene), 3);
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
