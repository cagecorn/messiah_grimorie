import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import projectileManager from '../../../systems/combat/ProjectileManager.js';
import combatManager from '../../../systems/CombatManager.js';
import instanceIDManager from '../../../utils/InstanceIDManager.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';
import ghostManager from '../../../systems/graphics/GhostManager.js';

/**
 * 위자드 투사체 (Wizard Projectile)
 * 역할: [위자드 전용 고속 추적 및 잔상 연출]
 * 
 * 특징:
 * 1. 일직선 고속 이동
 * 2. 이동 중 잔상(Ghosting) 생성
 * 3. 피격 시 보라색 파티클 폭발
 */
export default class WizardProjectile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'wizard_projectile');
        
        this.owner = null;
        this.target = null;
        this.damageMultiplier = 1.0;
        this.speed = 1000; // 위자드는 매우 빠름
        
        this.setBlendMode(Phaser.BlendModes.ADD);
        this.setScale(0.6);
        this.setOrigin(0.5, 0.5);

        this.id = "";
        
        scene.add.existing(this);
        this.setActive(false);
        this.setVisible(false);

        // 잔상 생성을 위한 타이머/카운터
        this.ghostTimer = 0;
    }

    /**
     * 발사 초기화
     */
    launch(owner, target, config = {}) {
        this.owner = owner;
        this.target = target;
        this.damageMultiplier = config.damageMultiplier || 1.0;
        this.speed = config.speed || 1000;
        
        this.id = instanceIDManager.generate(`proj_wizard_${owner.id}`);

        this.setPosition(owner.x, owner.y - 50);
        
        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(1);
        this.ghostTimer = 0;

        Logger.info("PROJECTILE", `Wizard Projectile ${this.id} fired from ${owner.logic.name}`);
    }

    update(time, delta) {
        if (!this.active || !this.target || !this.target.active) {
            if (this.active) this.destroyProjectile();
            return;
        }

        const targetX = this.target.x;
        const targetY = this.target.y - 40;

        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

        // 1. 일직선 고속 이동
        const moveDist = (this.speed * delta) / 1000;
        
        if (moveDist >= dist) {
            this.setPosition(targetX, targetY);
            this.hit();
        } else {
            const vx = Math.cos(angle) * moveDist;
            const vy = Math.sin(angle) * moveDist;
            this.x += vx;
            this.y += vy;

            // 2. 방향 연출 (이미지가 왼쪽을 바라봄)
            if (targetX > this.owner.x) {
                this.setFlipX(true);
                this.setRotation(angle);
            } else {
                this.setFlipX(false);
                this.setRotation(angle + Math.PI);
            }

            // 3. 잔상(Ghosting) 생성
            this.ghostTimer += delta;
            if (this.ghostTimer > 30) { // 30ms 마다 잔상 생성
                ghostManager.spawnGhost(this, {
                    alpha: 0.4,
                    duration: 200,
                    tint: 0xaa00ff // 보라색 틴트
                });
                this.ghostTimer = 0;
            }
        }
    }

    hit() {
        if (this.target && this.target.logic.isAlive) {
            combatManager.processDamage(this.owner, this.target, {
                multiplier: this.damageMultiplier,
                projectileId: this.id
            }, 'magic');

            // 보라색 섬광 파티클
            phaserParticleManager.spawnPurpleMagic(this.x, this.y);

            // 효과음 재생 (세라와 동일)
            if (this.scene.sound) {
                this.scene.sound.play('magic_hit_1', { volume: 0.5 });
            }
        }
        
        this.destroyProjectile();
    }

    destroyProjectile() {
        projectileManager.release(this);
    }
}
