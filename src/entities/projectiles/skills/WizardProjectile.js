import Phaser from 'phaser';
import TargetProjectile from '../TargetProjectile.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';
import ghostManager from '../../../systems/graphics/GhostManager.js';

/**
 * 위자드 투사체 (Wizard Projectile)
 * 역할: [위자드 전용 고속 추적 및 잔상 연출]
 * 특성: 타겟(Target) - 적을 끝까지 추격함.
 */
export default class WizardProjectile extends TargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'wizard_projectile');
        
        this.setBlendMode(Phaser.BlendModes.ADD);
        this.setScale(0.6);
        this.ghostTimer = 0;
        this.damageType = 'magic';
    }

    onLaunch(config) {
        this.speed = config.speed || 1000;
        this.ghostTimer = 0;
    }

    onUpdate(time, delta) {
        // 잔상(Ghosting) 생성 연출
        this.ghostTimer += delta;
        if (this.ghostTimer > 30) {
            ghostManager.spawnGhost(this, {
                alpha: 0.4,
                duration: 200,
                tint: 0xaa00ff
            });
            this.ghostTimer = 0;
        }
    }

    onHit(target) {
        // 보라색 섬광 파티클 연출 보존
        phaserParticleManager.spawnPurpleMagic(this.x, this.y);

        if (this.scene.sound) {
            this.scene.sound.play('magic_hit_1', { volume: 0.5 });
        }
    }
}
