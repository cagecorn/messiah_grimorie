import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import projectileManager from '../../systems/combat/ProjectileManager.js';
import combatManager from '../../systems/CombatManager.js';
import instanceIDManager from '../../utils/InstanceIDManager.js';
import layerManager from '../../ui/LayerManager.js';

/**
 * 타겟 투사체 베이스 (Target Projectile Base)
 * 역할: [유도(Homing) 기능이 있는 투사체의 공통 로직 관리]
 */
export default class TargetProjectile extends Phaser.GameObjects.Container {
    constructor(scene, x, y, texture) {
        super(scene, x, y);
        
        this.owner = null;
        this.target = null;
        this.damageMultiplier = 1.0;
        this.speed = 500;
        this.id = "";
        this.damageType = 'physical';

        // 발사 시점 추적용 (부드러운 보간을 위함)
        this.elapsedTime = 0;
        this.duration = 0;
        this.startX = 0;
        this.startY = 0;

        // 메인 스프라이트 생성 (컨테이너 기반)
        if (texture) {
            this.mainSprite = scene.add.sprite(0, 0, texture);
            this.add(this.mainSprite);
        }
        
        scene.add.existing(this);
    }

    /**
     * 스프라이트 관련 대리자 메서드 (Proxy methods)
     */
    setFlipX(value) {
        if (this.mainSprite) this.mainSprite.setFlipX(value);
        return this;
    }

    setFrame(frame) {
        if (this.mainSprite) this.mainSprite.setFrame(frame);
        return this;
    }

    setOrigin(x, y) {
        if (this.mainSprite) this.mainSprite.setOrigin(x, y);
        return this;
    }

    /**
     * 발사 초기화
     */
    launch(owner, target, config = {}) {
        this.owner = owner;
        this.target = target;
        this.damageMultiplier = config.damageMultiplier || 1.0;
        this.speed = config.speed || 500;
        this.damageType = config.damageType || this.damageType || 'physical';
        
        this.id = instanceIDManager.generate(`proj_target_${owner.id}`);

        // 초기 위치 설정 (몸통 높이 보정)
        this.setPosition(owner.x, owner.y - 40);
        this.startX = this.x;
        this.startY = this.y;
        
        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(1);
        layerManager.assignToLayer(this, 'fx');
        this.elapsedTime = 0;

        // 초기 거리 기반 예상 비행 시간 계산
        if (this.target) {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            this.duration = (dist / this.speed) * 1000; // ms
        }

        this.onLaunch(config);
    }

    /**
     * 상속받은 클래스에서 추가적인 초기화가 필요할 때 오버라이드
     */
    onLaunch(config) {}

    update(time, delta) {
        if (!this.active || !this.target || !this.target.active) {
            if (this.active) this.destroyProjectile();
            return;
        }

        this.elapsedTime += delta;
        
        // 1. 유도 기능 (Homing Logic)
        // 타겟의 현재 위치를 가져옴
        const targetX = this.target.x;
        const targetY = this.target.y - 40;

        // 타겟 방향으로 비행
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

        const moveDist = (this.speed * delta) / 1000;

        if (moveDist >= dist) {
            this.setPosition(targetX, targetY);
            this.hit();
        } else {
            this.x += Math.cos(angle) * moveDist;
            this.y += Math.sin(angle) * moveDist;

            // 2. 방향 연출 (이미지가 왼쪽을 바라봄)
            this.updateRotation(angle, targetX > this.x);
        }

        this.onUpdate(time, delta);
    }

    /**
     * 회전 및 반전 업데이트 (이미지가 기본적으로 왼쪽을 바라보고 있다고 가정)
     */
    updateRotation(angle, isFacingRight) {
        if (isFacingRight) {
            this.setFlipX(true);
            this.setRotation(angle);
        } else {
            this.setFlipX(false);
            this.setRotation(angle + Math.PI);
        }
    }

    onUpdate(time, delta) {}

    /**
     * 타격 처리
     */
    hit() {
        if (this.target && this.target.logic && this.target.logic.isAlive) {
            combatManager.processDamage(this.owner, this.target, {
                multiplier: this.damageMultiplier,
                projectileId: this.id
            }, this.damageType);
            this.onHit(this.target);
        }
        this.destroyProjectile();
    }

    onHit(target) {}

    /**
     * 투사체 반사 (Reflection/Parry)
     * @param {CombatEntity} reflector 반사 시전자
     * @param {CombatEntity} newTarget 새로운 유도 대상
     */
    reflect(reflector, newTarget) {
        if (!this.active) return;
        
        this.owner = reflector;
        this.target = newTarget;
        
        // 시간 및 비행 데이터 초기화
        this.elapsedTime = 0;
        this.startX = this.x;
        this.startY = this.y;
        
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        this.duration = (dist / this.speed) * 1000;

        // 반사 비주얼 피드백 (약간의 푸른빛 또는 효과 추가 가능)
        if (this.mainSprite) {
            this.mainSprite.setTint(0x00ffff);
        }

        Logger.info("PROJ", `Projectile ${this.id} reflected by ${reflector.logic.name} towards ${newTarget.logic.name}.`);
    }

    destroyProjectile() {
        projectileManager.release(this);
    }
}
