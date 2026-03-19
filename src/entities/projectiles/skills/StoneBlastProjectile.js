import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import aoeManager from '../../../systems/combat/AOEManager.js';
import animationManager from '../../../systems/graphics/AnimationManager.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';

/**
 * 스톤 블래스트 투사체 (Stone Blast Projectile)
 * 역할: [염력으로 던져진 거대 바위. 지면 충돌 시 광역 마법 피해]
 * 
 * 특징:
 * - 논타겟 방식 (지정된 지점을 향해 발사)
 * - 투사체 이미지가 왼쪽을 보고 있으므로 회전/반전 처리 필요
 */
export default class StoneBlastProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'stone_blast_projectile');
        this.setScale(1.2);
        this.damageType = 'magic';
        this.aoeRadius = 150;
        this.aoeMultiplier = 1.6;
    }

    onLaunch(config) {
        this.speed = config.speed || 700;
        this.aoeRadius = config.radius || 150;
        this.aoeMultiplier = config.damageMultiplier || 1.6;
        
        // 투사체 이미지 방향 처리
        // 원본이 왼쪽(Left)을 보고 있음. 
        // 1. 진행 방향이 오른쪽이면 가로 반전(flipX = true)
        // 2. 각도는 velocity에 맞춰 회전
        this.updateDirection();
    }

    onUpdate(time, delta) {
        // 매 프레임 속도 벡터에 맞춰 각도 업데이트 (부드러운 궤적)
        this.updateDirection();
    }

    /**
     * 투사체 방향 및 각도 보정
     */
    updateDirection() {
        if (!this.body) return;

        const velocity = this.body.velocity;
        if (velocity.x === 0 && velocity.y === 0) return;

        // 원본이 왼쪽(-1, 0) 기준이므로 Math.atan2(y, x)에서 PI를 빼주어 오프셋 보정
        // 혹은 flipX를 쓰고 0도 기준으로 계산
        const angle = Math.atan2(velocity.y, velocity.x);
        
        // 이미지가 왼쪽(-X)을 보고 있으므로 기본 각도 180도(PI) 오프셋
        this.rotation = angle + Math.PI;

        // 보다 직관적인 처리를 원한다면:
        // if (velocity.x > 0) {
        //     this.setFlipX(true); // 오른쪽으로 갈 때 반전
        //     this.rotation = angle; // 각도 보정 필요
        // } else {
        //     this.setFlipX(false);
        //     this.rotation = angle + Math.PI;
        // }
    }

    explode() {
        // [시각 효과] 전용 석벽 폭발 연출
        animationManager.playStoneExplosion(this.x, this.y);
        
        // 지면 먼지 효과 (기존 활용)
        phaserParticleManager.spawnImpactDust(this.x, this.y);

        if (this.scene.cameras.main) {
            this.scene.cameras.main.shake(150, 0.006);
        }

        if (this.scene.sound) {
            this.scene.sound.play('explosive_1', { volume: 0.5 });
        }

        // [데미지 처리] AOEManager를 통한 광역 데미지
        aoeManager.applyAOE(this.x, this.y, {
            radius: this.aoeRadius,
            multiplier: this.aoeMultiplier,
            owner: this.owner,
            damageType: 'magic',
            skillId: 'stone_blast'
        });

        super.explode();
    }
}
