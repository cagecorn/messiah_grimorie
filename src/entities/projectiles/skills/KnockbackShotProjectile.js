import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import Knockback from '../../../systems/combat/effects/Knockback.js';
import trailManager from '../../../systems/graphics/TrailManager.js';
import ghostManager from '../../../systems/graphics/GhostManager.js';
import layerManager from '../../../ui/LayerManager.js';

/**
 * 넉백 샷 투사체 (Knockback Shot Projectile)
 * 역할: [관통형, 선형 비행, 피격 시 넉백 적용]
 * 특성: 논타겟(Non-Target) - 직선으로 날아가며 경로상의 적들을 관통함.
 */
export default class KnockbackShotProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'knockback_shot_projectile');
        this.damageType = 'physical';
    }

    onLaunch(config) {
        this.speed = config.speed || 800;
        this.isPierce = true; // 넉백샷은 관통함
        this.setScale(0.3);
        layerManager.assignToLayer(this, 'fx');

        // 궤적 및 연출 설정
        this.trail = trailManager.createKnockbackTrail(this);
        this.ghostTimer = 0;

        // 물리 설정 (Base class의 velocityFromRotation 대신 여기서 직접 제어도 가능하지만 
        // Base class의 update와 충돌하지 않게 onLaunch에서 설정)
        if (!this.body) {
            this.scene.physics.add.existing(this);
        }
        this.body.setEnable(true);
        
        // 방향은 launch 시점에 정해짐 (targetPoint 기준)
        const angle = Phaser.Math.Angle.Between(this.owner.x, this.owner.y, this.targetPos.x, this.targetPos.y);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        this.rotation = angle;
    }

    /**
     * 관통형이므로 update를 오버라이드하여 물리 중심 이동 사용
     */
    update(time, delta) {
        if (!this.active) return;

        // 가속도 적용
        const acceleration = 400;
        this.speed += acceleration * (delta / 1000);
        
        if (this.body && this.body.enable) {
            const angle = this.rotation; // launch에서 설정한 각도 유지
            this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        }

        // 잔상 연출
        this.ghostTimer += delta;
        if (this.ghostTimer > 40) {
            ghostManager.spawnGhost(this, {
                lifeTime: 200,
                tint: 0xff3333,
                alpha: 0.5
            });
            this.ghostTimer = 0;
        }

        // 화면 밖 체크
        const bounds = this.scene.physics.world.bounds;
        if (this.x < 0 || this.x > bounds.width || this.y < 0 || this.y > bounds.height) {
            this.destroyProjectile();
            return;
        }

        // 충돌 체크 (Base class 로직 활용)
        this.checkCollisions();
    }

    onHit(target) {
        // 넉백 적용
        Knockback.apply(target, 150, 400, this.owner);
    }

    destroyProjectile() {
        if (this.trail) {
            trailManager.stopTrail(this.trail);
            this.trail = null;
        }
        super.destroyProjectile();
    }
}
