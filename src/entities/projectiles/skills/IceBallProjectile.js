import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';
import ghostManager from '../../../systems/graphics/GhostManager.js';
import aoeManager from '../../../systems/combat/AOEManager.js';
import animationManager from '../../../systems/graphics/AnimationManager.js';

/**
 * 아이스볼 투사체 (Ice Ball Projectile)
 * 역할: [적 밀집 지역에 발사되어 범위 피해를 입히는 얼음 구체]
 */
export default class IceBallProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'ice_ball_projectile');
        
        this.setBlendMode(Phaser.BlendModes.ADD);
        this.setScale(0.8);
        this.ghostTimer = 0;
        this.damageType = 'magic';
        this.radius = 120; // AOE 반경
    }

    onLaunch(config) {
        this.speed = config.speed || 850;
        this.ghostTimer = 0;
        this.radius = config.radius || 120;
        
        // 얼음 파티클 시작 효과
        phaserParticleManager.spawnBlueMagic(this.x, this.y);
    }

    onUpdate(time, delta) {
        // 푸른 잔상(Ghosting) 생성 연출
        this.ghostTimer += delta;
        if (this.ghostTimer > 40) {
            ghostManager.spawnGhost(this, {
                alpha: 0.5,
                duration: 300,
                tint: 0x00ccff
            });
            this.ghostTimer = 0;
        }
    }

    onHit(target) {
        // 타겟에 직접 충돌했을 때도 AOE 발동을 위해 explode 호출 (NonTargetProjectile의 hit에서 pierce가 아니면 호출됨)
    }

    onHitGround() {
        // 지면에 도달했을 때 AOE 발동
    }

    explode() {
        // 범위 데미지 적용
        aoeManager.applyAOEDamagingEffect(
            this.owner,
            this.x,
            this.y,
            this.radius,
            this.damageMultiplier,
            this.damageType
        );

        // 얼음 충격 파티클 및 애니메이션 연출
        phaserParticleManager.spawnBlueMagic(this.x, this.y);
        animationManager.playIceExplosion(this.x, this.y); 

        if (this.scene.sound) {
            this.scene.sound.play('magic_hit_1', { volume: 0.4, detune: 500 });
        }

        super.explode();
    }
}
