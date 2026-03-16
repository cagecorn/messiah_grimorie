import Phaser from 'phaser';
import TargetProjectile from '../TargetProjectile.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';

/**
 * 빛의 투사체 (Light Projectile)
 * 역할: [힐러 전용 일직선 추적 및 타격]
 * 특성: 타겟(Target) - 적을 끝까지 추격함.
 */
export default class LightProjectile extends TargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, null);
        this.damageType = 'magic';
        
        // 3중 레이어 스프라이트 생성
        this.layers = [];
        for (let i = 0; i < 3; i++) {
            const sprite = scene.add.image(0, 0, 'light_projectile');
            sprite.setBlendMode(Phaser.BlendModes.ADD);
            sprite.setScale(0.5);
            sprite.setAlpha(1.0 - (i * 0.2));
            this.add(sprite);
            this.layers.push(sprite);
        }
    }

    onLaunch(config) {
        this.speed = config.speed || 700;
        
        // 레이어 초기화
        this.layers.forEach((s, i) => {
            s.setScale(0.5);
            s.setAlpha(1.0 - (i * 0.2));
        });
    }

    onUpdate(time, delta) {
        // 레이어 미세 애니메이션 (반짝임)
        this.layers.forEach((s, i) => {
            s.setAlpha((1.0 - (i * 0.2)) * (0.8 + Math.sin(time * 0.01 + i) * 0.2));
        });
    }

    onHit(target) {
        // 노란색 섬광 파티클
        phaserParticleManager.spawnMagicFlash(this.x, this.y);

        if (this.scene.sound) {
            this.scene.sound.play('magic_hit_1', { volume: 0.5 });
        }
    }
}
