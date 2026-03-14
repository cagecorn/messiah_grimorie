import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import projectileManager from '../../../systems/combat/ProjectileManager.js';
import combatManager from '../../../systems/CombatManager.js';
import instanceIDManager from '../../../utils/InstanceIDManager.js';
import layerManager from '../../../ui/LayerManager.js';

/**
 * 실비 궁극기 투사체: 😭💦 (Im Sorry Projectile)
 * 역할: [텍스트 기반 이모지 투사체, 랜덤 발산, 다단히트]
 */
export default class ImSorryProjectile extends Phaser.GameObjects.Text {
    constructor(scene, x, y) {
        // 초기 생성 시에는 텍스트를 비워둠
        super(scene, x, y, '', { 
            fontSize: '48px', 
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });

        this.owner = null;
        this.damageMultiplier = 0.5; // 다단히트이므로 낮게 설정
        this.speed = 400;
        this.hitTargets = new Set();
        this.id = "";
        this.lifespan = 2000;
        this.elapsed = 0;

        this.setOrigin(0.5, 0.5);
    }

    launch(owner, target, config = {}) {
        this.owner = owner;
        this.damageMultiplier = config.damageMultiplier || 0.4;
        this.speed = config.speed || (200 + Math.random() * 300);
        this.hitTargets.clear();
        this.elapsed = 0;
        this.lifespan = config.lifespan || 1500;

        this.id = instanceIDManager.generate(`proj_imsorry_${owner.id}`);

        // 😭 또는 💦 중 랜덤 선택
        const emoji = Math.random() < 0.6 ? '😭' : '💦';
        this.setText(emoji);

        // 랜덤 방향으로 발사
        const angle = config.angle !== undefined ? config.angle : Math.random() * Math.PI * 2;
        this.rotation = 0; // 텍스트는 회전시키지 않거나 취향대로

        this.setX(owner.x);
        this.setY(owner.y - 40);

        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(1.0);
        this.setScale(0.5 + Math.random() * 1.0); // 다양한 크기
        
        // [수정] FX 레이어(800)로 배치하여 엔티티보다 위에서 보이게 함
        layerManager.assignToLayer(this, 'fx');

        // 물리 엔진 등록
        if (!this.body) {
            this.scene.physics.add.existing(this);
        }
        this.body.setEnable(true);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

        // 약간의 중력 효과 (바닥으로 떨어지는 느낌)
        this.body.setGravityY(400);

        Logger.info("PROJECTILE", `Im Sorry Emoji fired: ${emoji} (${this.id})`);
    }

    update(time, delta) {
        if (!this.active) return;

        this.elapsed += delta;
        
        // 서서히 투명해짐
        const ratio = this.elapsed / this.lifespan;
        this.setAlpha(1 - ratio);

        // 시간 다 되면 제거
        if (this.elapsed > this.lifespan) {
            this.destroyProjectile();
            return;
        }

        // 화면 밖으로 나가면 제거
        const world = this.scene.physics.world.bounds;
        if (this.x < 0 || this.x > world.width || this.y < 0 || this.y > world.height) {
            this.destroyProjectile();
            return;
        }

        // 충돌 체크
        const enemies = (this.owner.team === 'mercenary') ? this.scene.enemies : this.scene.allies;
        enemies.forEach(enemy => {
            if (this.hitTargets.has(enemy.id)) return;

            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y - 40);
            if (dist < 40) {
                this.hit(enemy);
            }
        });
    }

    hit(target) {
        if (!target || !target.logic.isAlive) return;

        // 다단히트 허용 여부에 따라 Set 추가
        this.hitTargets.add(target.id);

        combatManager.processDamage(this.owner, target, {
            multiplier: this.damageMultiplier,
            projectileId: this.id
        });

        // 히트 효과 (약간 튕겨나감)
        this.scene.tweens.add({
            targets: this,
            scale: this.scale * 1.2,
            duration: 100,
            yoyo: true
        });
    }

    destroyProjectile() {
        if (this.body) this.body.setEnable(false);
        projectileManager.release(this);
    }
}
