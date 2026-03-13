import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import instanceIDManager from '../../../utils/InstanceIDManager.js';
import trailManager from '../../../systems/graphics/TrailManager.js';
import ghostManager from '../../../systems/graphics/GhostManager.js';
import layerManager from '../../../ui/LayerManager.js';
import combatManager from '../../../systems/CombatManager.js';

/**
 * 운명의 끈 전용 투사체 (Threads of Fate Projectile)
 * 역할: [화면 가로지르기 + 실 형태의 궤적 + 관통 데미지]
 */
export default class ThreadsOfFateProjectile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'knockback_shot_projectile');
        
        this.owner = null;
        this.damageMultiplier = 1.0;
        this.speed = 2500; // 매우 빠른 속도
        this.hitTargets = new Set();
        
        this.setOrigin(0.5, 0.5);
    }

    launch(owner, targetPoint, config = {}) {
        this.owner = owner;
        this.damageMultiplier = config.damageMultiplier || 1.0;
        this.speed = config.speed || 2500;
        this.hitTargets.clear();
        
        this.id = instanceIDManager.generate(`proj_thread_${owner.id}`);

        // 발사 위치 및 방향 설정
        // config에서 startPos, targetPos를 직접 받음 (화면 밖 -> 화면 밖)
        const startPos = config.startPos;
        const endPos = config.targetPos;

        this.setPosition(startPos.x, startPos.y);
        
        const angle = Phaser.Math.Angle.BetweenPoints(startPos, endPos);
        this.setRotation(angle);

        this.setActive(true);
        this.setVisible(true);
        this.setScale(0.4); 
        layerManager.assignToLayer(this, 'entities');

        // [핵심] 끈 형태의 궤적 활성화
        this.trail = trailManager.createThreadTrail(this);
        this.ghostTimer = 0;

        // 물리 설정
        if (!this.body) {
            this.scene.physics.add.existing(this);
        }
        this.body.setEnable(true);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

        Logger.info("PROJECTILE", `Thread launched from (${Math.round(startPos.x)}, ${Math.round(startPos.y)})`);
    }

    update(time, delta) {
        if (!this.active) return;

        // [USER 요청] 띄엄띄엄 생기는 잔상을 제거하고, TrailManager의 고밀도 직선 궤적에 집중
        // ghostManager.spawnGhost 로직 제거

        // 충돌 체크 (관통형)
        this.checkCollisions();

        // 화면 밖으로 충분히 나가면 자동 제거
        const margin = 200;
        const bounds = this.scene.physics.world.bounds;
        if (this.x < -margin || this.x > bounds.width + margin || 
            this.y < -margin || this.y > bounds.height + margin) {
            this.destroyProjectile();
        }
    }

    checkCollisions() {
        const enemies = this.scene.enemies;
        enemies.forEach(enemy => {
            if (this.hitTargets.has(enemy.id)) return;
            
            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y - 40);
            if (dist < 60) {
                this.hit(enemy);
            }
        });
    }

    hit(target) {
        if (!target || !target.logic.isAlive) return;
        this.hitTargets.add(target.id);
        
        combatManager.processDamage(this.owner, target, {
            multiplier: this.damageMultiplier,
            type: 'physical',
            isUltimate: true
        });
    }

    destroyProjectile() {
        if (this.body) this.body.setEnable(false);
        if (this.trail) {
            trailManager.stopTrail(this.trail);
            this.trail = null;
        }
        
        this.setActive(false);
        this.setVisible(false);
        if (this.scene.projectileManager) {
            this.scene.projectileManager.release(this);
        }
    }
}
