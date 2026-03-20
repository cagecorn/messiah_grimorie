import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import aoeManager from '../../../systems/combat/AOEManager.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';
import pooledElectricExplosionEffect from '../../../systems/graphics/effects/PooledElectricExplosionEffect.js';

/**
 * 전기 수류탄 투사체 (Electric Grenade Projectile)
 * 역할: [포물선을 그리며 목표 지점으로 날아가 폭발]
 */
export default class ElectricGrenadeProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        // 'electric_grenade_projectile'은 AssetPathManager에 등록됨
        super(scene, x, y, 'electric_grenade_projectile');
        
        this.setOrigin(0.5, 0.5);
        this.damageType = 'physical';
        this.attribute = 'lightning';
        this.arcHeight = 100; // 포물선 높이
    }

    onLaunch(config) {
        this.damageMultiplier = config.damageMultiplier || 1.8;
        this.aoeRadius = config.radius || 120;
        
        // 거리 계산 및 체류 시간 결정
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
        this.duration = Math.max(500, dist * 0.8); // 최소 0.5초, 거리에 비례
        this.elapsed = 0;
        
        this.startX = this.x;
        this.startY = this.y;
        
        // 수류탄 회전 가속도
        this.rotationSpeed = 0.2;
    }

    onUpdate(time, delta) {
        this.elapsed += delta;
        let progress = Math.min(1, this.elapsed / this.duration);
        
        // 1. 선형 이동 (X, Y)
        const nextX = Phaser.Math.Linear(this.startX, this.targetPos.x, progress);
        const nextY = Phaser.Math.Linear(this.startY, this.targetPos.y, progress);
        
        // 2. 포물선 계산 (Arc Offset)
        // offset = 4 * height * progress * (1 - progress)
        const arcOffset = 4 * this.arcHeight * progress * (1 - progress);
        
        this.setPosition(nextX, nextY - arcOffset);
        
        // 3. 자가 회전
        this.rotation += this.rotationSpeed;
        
        // 4. 도착 체크
        if (progress >= 1) {
            this.onExplode();
        }
    }

    onExplode() {
        if (this.isDestroyed) return;

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
            false // isUltimate
        );

        // 전기 폭발 연출
        pooledElectricExplosionEffect.spawn(this.x, this.y);
        
        // 사운드 연출
        if (this.scene.sound) {
            this.scene.sound.play('explosive_1', { volume: 0.5, detune: 500 });
        }

        this.destroyProjectile();
    }
}
