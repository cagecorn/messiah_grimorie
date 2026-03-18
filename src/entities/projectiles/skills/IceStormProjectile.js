import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';
import animationManager from '../../../systems/graphics/AnimationManager.js';

/**
 * 아이스스톰 투사체 (Ice Storm Projectile)
 * 역할: [하늘에서 떨어지는 눈송이/얼음 조각. 다단히트용]
 */
export default class IceStormProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'ice_storm_projectile');
        
        this.setBlendMode(Phaser.BlendModes.ADD);
        this.damageType = 'magic';
        this.collisionRadius = 30;
    }

    onLaunch(config) {
        this.speed = config.speed || 600;
        this.setScale(config.scale || 0.8);
        this.setAlpha(0.8);
        
        // 떨어질 때 약간의 회전
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 1000,
            repeat: -1
        });
    }

    onHit(target) {
        // 명중 시 작은 얼음 파티클
        phaserParticleManager.spawnBlueMagic(this.x, this.y, 2);
    }

    onHitGround() {
        // 바닥에 닿았을 때 연출
        phaserParticleManager.spawnBlueMagic(this.x, this.y, 3);
    }

    explode() {
        // 아이스스톰은 개수가 많으므로 무거운 연출은 피함
        this.destroyProjectile();
    }
}
