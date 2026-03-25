import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import aoeManager from '../../../systems/combat/AOEManager.js';
import animationManager from '../../../systems/graphics/AnimationManager.js';

/**
 * 융단폭격 미사일 투사체 (Carpet Bombing Missile Projectile)
 * 역할: [비행기에서 투하되어 지면에 닿으면 폭발 및 범위 피해]
 */
export default class CarpetBombingMissileProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'missile_projectile');
        
        this.setOrigin(0.5, 0.5);
        this.damageType = 'physical';
        this.attribute = 'none';
    }

    onLaunch(config) {
        this.damageMultiplier = config.multiplier || 0.4;
        this.aoeRadius = config.radius || 150;
        
        const startX = config.startX || this.x;
        const startY = config.startY || this.y;
        this.setPosition(startX, startY);

        this.targetPos = {
            x: config.targetX || this.x,
            y: config.targetY || 600
        };

        // 미사일 속도 및 각도
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
        this.duration = 400 + Math.random() * 200; // 0.4~0.6초 내 낙하
        this.elapsed = 0;
        
        this.startX = this.x;
        this.startY = this.y;
        
        // 각도 조절 (목표 지점 바라보기)
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
        this.setRotation(angle + Math.PI / 2);
    }

    onUpdate(time, delta) {
        this.elapsed += delta;
        let progress = Math.min(1, this.elapsed / this.duration);
        
        // 선형 낙하
        const nextX = Phaser.Math.Linear(this.startX, this.targetPos.x, progress);
        const nextY = Phaser.Math.Linear(this.startY, this.targetPos.y, progress);
        
        this.setPosition(nextX, nextY);
        
        if (progress >= 1) {
            this.onExplode();
        }
    }

    onExplode() {
        if (!this.active) return;

        // AOE 피해 적용
        aoeManager.applyAOEDamagingEffect(
            this.owner,
            this.x,
            this.y,
            this.aoeRadius,
            this.damageMultiplier,
            this.damageType,
            this.attribute,
            null,
            true // isUltimate
        );

        // 폭발 연출 (AnimationManager 활용)
        animationManager.playExplosion(this.x, this.y, 1.2);
        
        // 사운드
        if (this.scene.sound) {
            this.scene.sound.play('explosive_1', { volume: 0.4, detune: Phaser.Math.Between(-200, 200) });
        }

        this.destroyProjectile();
    }
}
