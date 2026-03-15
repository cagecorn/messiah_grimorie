import Phaser from 'phaser';
import TargetProjectile from '../TargetProjectile.js';

/**
 * 바드 음표 투사체 (Bard Projectile)
 * 역할: [타겟 추적 및 직선 비행 로직]
 * 특성: 타겟(Target) - 적을 끝까지 추격함.
 */
export default class BardProjectile extends TargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'bard_projectile_effect');
        this.damageType = 'magic';
    }

    onLaunch(config) {
        this.speed = config.speed || 450;
        this.setScale(1.0);
    }
}
