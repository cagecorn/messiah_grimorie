import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import projectileManager from '../../../systems/combat/ProjectileManager.js';
import combatManager from '../../../systems/CombatManager.js';
import instanceIDManager from '../../../utils/InstanceIDManager.js';
import Knockback from '../../../systems/combat/effects/Knockback.js';

/**
 * 넉백 샷 투사체 (Knockback Shot Projectile)
 * 역할: [관통형, 선형 비행, 피격 시 넉백 적용]
 */
export default class KnockbackShotProjectile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'knockback_shot_projectile');
        
        this.owner = null;
        this.damageMultiplier = 1.5;
        this.speed = 800;
        this.hitTargets = new Set(); // 관통형이므로 중복 타격 방지
        
        this.setOrigin(0.5, 0.5);
        this.id = "";
    }

    launch(owner, target, config = {}) {
        this.owner = owner;
        this.damageMultiplier = config.damageMultiplier || 1.5;
        this.speed = config.speed || 800;
        this.hitTargets.clear();
        
        this.id = instanceIDManager.generate(`proj_knockback_${owner.id}`);

        // 타겟 방향으로 발사 (타겟의 현재 위치 기준 방향 벡터)
        const angle = Phaser.Math.Angle.Between(owner.x, owner.y, target.x, target.y);
        this.rotation = angle;

        this.setX(owner.x);
        this.setY(owner.y - 40);
        
        this.setActive(true);
        this.setVisible(true);
        this.setScale(0.5); // [USER 요청] 화살 크기 절반으로 축소

        // 방향에 따른 플립 (이미지가 왼쪽을 보고 있다고 가정)
        if (Math.abs(angle) < Math.PI / 2) {
            this.setFlipX(true);
            this.setRotation(angle);
        } else {
            this.setFlipX(false);
            this.setRotation(angle + Math.PI);
        }

        // 물리 바디 활성화
        if (!this.body) {
            this.scene.physics.add.existing(this);
        }
        this.body.setEnable(true);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

        Logger.info("PROJECTILE", `Knockback Shot fired: ${this.id}`);
    }

    update() {
        if (!this.active) return;

        // 화면 밖으로 나가면 제거
        const world = this.scene.physics.world.bounds;
        if (this.x < 0 || this.x > world.width || this.y < 0 || this.y > world.height) {
            this.destroyProjectile();
            return;
        }

        // 충돌 체크 (관통형)
        const enemies = this.scene.enemies;
        enemies.forEach(enemy => {
            if (this.hitTargets.has(enemy.id)) return;
            
            // 거리 기반 충돌 (물리 바디를 써도 되지만 간단하게 거리로 처리)
            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y - 40);
            if (dist < 50) {
                this.hit(enemy);
            }
        });
    }

    hit(target) {
        if (!target || !target.logic.isAlive) return;
        
        this.hitTargets.add(target.id);
        
        // 1. 데미지 적용
        combatManager.processDamage(this.owner, target, {
            multiplier: this.damageMultiplier,
            projectileId: this.id
        });

        // 2. 넉백 적용
        Knockback.apply(target, 150, 400, this.owner);

        Logger.info("PROJECTILE", `Knockback Shot hit ${target.logic.name}`);
    }

    destroyProjectile() {
        if (this.body) this.body.setEnable(false);
        projectileManager.release(this);
    }
}
