import Phaser from 'phaser';
import NonTargetProjectileText from '../NonTargetProjectileText.js';
import layerManager from '../../../ui/LayerManager.js';
import Logger from '../../../utils/Logger.js';

/**
 * 실비 궁극기 투사체: 😭💦 (Im Sorry Projectile)
 * 역할: [텍스트 기반 이모지 투사체, 랜덤 발산, 다단히트]
 */
export default class ImSorryProjectile extends NonTargetProjectileText {
    constructor(scene, x, y) {
        super(scene, x, y, '', { 
            fontSize: '48px', 
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        
        this.lifespan = 2000;
        this.elapsed = 0;
    }

    onLaunch(config) {
        this.damageMultiplier = config.damageMultiplier || 0.4;
        this.speed = config.speed || (200 + Math.random() * 300);
        this.elapsed = 0;
        this.lifespan = config.lifespan || 1500;
        this.isPierce = true; // 다단히트나 관통 느낌
        
        // 😭 또는 💦 중 랜덤 선택
        const emoji = Math.random() < 0.6 ? '😭' : '💦';
        this.setText(emoji);

        // 랜덤 방향 설정
        const angle = config.angle !== undefined ? config.angle : Math.random() * Math.PI * 2;
        
        this.setScale(0.5 + Math.random() * 1.0);
        layerManager.assignToLayer(this, 'fx');

        // 물리 엔진 활용
        if (!this.body) {
            this.scene.physics.add.existing(this);
        }
        this.body.setEnable(true);
        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

        // 약간의 중력 효과 (바닥으로 떨어지는 느낌)
        this.body.setGravityY(400);

        Logger.info("PROJECTILE", `Im Sorry Emoji fired: ${emoji}`);
    }

    onUpdate(time, delta) {
        this.elapsed += delta;
        
        // 서서히 투명해짐
        const ratio = this.elapsed / this.lifespan;
        this.setAlpha(1 - ratio);

        // 시간 다 되면 제거
        if (this.elapsed > this.lifespan) {
            this.destroyProjectile();
            return;
        }

        // 화면 밖 체크
        const world = this.scene.physics.world.bounds;
        if (this.x < 0 || this.x > world.width || this.y < 0 || this.y > world.height) {
            this.destroyProjectile();
        }
    }

    onHit(target) {
        // 히트 효과 (약간 튕겨나감)
        this.scene.tweens.add({
            targets: this,
            scale: this.scale * 1.2,
            duration: 100,
            yoyo: true
        });
    }
}
