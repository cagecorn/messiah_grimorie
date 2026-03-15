import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import trailManager from '../../../systems/graphics/TrailManager.js';
import layerManager from '../../../ui/LayerManager.js';

/**
 * 운명의 끈 전용 투사체 (Threads of Fate Projectile)
 * 역할: [화면 가로지르기 + 실 형태의 궤적 + 관통 데미지]
 */
export default class ThreadsOfFateProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'knockback_shot_projectile'); // 기존 자산 재활용
        this.damageType = 'physical';
    }

    onLaunch(config) {
        this.speed = config.speed || 2500;
        this.isPierce = true;
        this.setScale(0.4);
        layerManager.assignToLayer(this, 'fx');

        // 시작/종료 지점이 특수하므로 다시 계산 (화면 밖 -> 화면 밖)
        const startPos = config.startPos;
        const endPos = config.targetPos;
        if (startPos && endPos) {
            this.setPosition(startPos.x, startPos.y);
            this.targetPos = endPos;
            const angle = Phaser.Math.Angle.BetweenPoints(startPos, endPos);
            this.setRotation(angle);
            
            if (!this.body) this.scene.physics.add.existing(this);
            this.body.setEnable(true);
            this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        }

        // [USER 요청] 위치가 결정된 후 궤적 생성 (그래야 시작점이 정확함)
        this.trail = trailManager.createThreadTrail(this);
    }

    update(time, delta) {
        if (!this.active) return;
        
        this.checkCollisions();

        // [신규] 직선 궤적 업데이트
        if (this.trail && this.trail.update) {
            this.trail.update();
        }
        const margin = 200;
        const bounds = this.scene.physics.world.bounds;
        if (this.x < -margin || this.x > bounds.width + margin || 
            this.y < -margin || this.y > bounds.height + margin) {
            this.destroyProjectile();
        }
    }

    destroyProjectile() {
        if (this.trail) {
            trailManager.stopTrail(this.trail);
            this.trail = null;
        }
        super.destroyProjectile();
    }
}
