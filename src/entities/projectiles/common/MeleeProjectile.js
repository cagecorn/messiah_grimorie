import Phaser from 'phaser';
import TargetProjectile from '../TargetProjectile.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';
import Logger from '../../../utils/Logger.js';

/**
 * 근접 투사체 (Melee Projectile)
 * 역할: [근접 공격을 투사체 시스템으로 단일화]
 * 특성: 매우 빠른 속도, 짧은 사거리, 보이지 않거나 가벼운 잔상 효과
 */
export default class MeleeProjectile extends TargetProjectile {
    constructor(scene, x, y) {
        // [수정] null 대신 melee_effect 텍스처 할당 (이미지는 기본적으로 왼쪽을 응시함)
        super(scene, x, y, 'melee_effect');
        this.damageType = 'physical';
        
        // 이미지 설정 (기본적으로 왼쪽 응시이므로 각도 보정 필요 시 여기서 조정 가능하나, TargetProjectile의 updateRotation에서 후처리됨)
        if (this.mainSprite) {
            this.mainSprite.setScale(0.8);
        }
    }

    onLaunch(config) {
        // 근접 공격이므로 속도가 매우 빨라야 함 (거의 즉시 타격)
        this.speed = config.speed || 2500; 
        
        // [DEBUG] 근접 투사체 발사 로그
        Logger.info("MELEE_PROJ", `Melee projectile fired from ${this.owner.logic.name} to ${this.target.logic.name}`);
    }

    onHit(target) {
        // 근접 타격 파티클/사운드는 이미 CombatManager에서 처리하므로
        // 여기서는 투사체 전역 옵션(추가 탄두 등)에 대한 확장 포인트로 활용
        
        // [DEBUG] 근접 투사체 타격 로그
        Logger.info("MELEE_PROJ", `Melee projectile HIT: ${target.logic.name}`);
    }
}
