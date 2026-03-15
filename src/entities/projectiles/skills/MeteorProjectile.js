import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import projectileManager from '../../../systems/combat/ProjectileManager.js';
import aoeManager from '../../../systems/combat/AOEManager.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';
import ghostManager from '../../../systems/graphics/GhostManager.js';
import layerManager from '../../../ui/LayerManager.js';
import animationManager from '../../../systems/graphics/AnimationManager.js';

/**
 * 운석 투사체 (Meteor Projectile)
 * 역할: [하늘에서 대각선으로 떨어지는 거대 운석 연출 및 범위 타격]
 * 
 * 특징:
 * 1. 하늘(Y-1200)에서 지면으로 대각선 낙하
 * 2. 이동 중 잔상(Ghosting) + 붉은 파티클 트레일
 * 3. 지면 도달 시 AOE 기반 범위 데미지 + 거대 폭발
 */
export default class MeteorProjectile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'meteor_sprite');
        
        this.owner = null;
        this.targetPos = { x: 0, y: 0 };
        this.damageMultiplier = 1.0;
        this.speed = 1500;
        this.radius = 150;
        
        // [USER 요청] 오리진을 머리(돌) 부분으로 설정 (0.5, 0.9)
        // 이렇게 해야 지면에 닿는 순간(x, y가 targetPos일 때) 머리가 지면에 정확히 위치함
        this.setOrigin(0.5, 0.9);
        this.setBlendMode(Phaser.BlendModes.NORMAL);

        scene.add.existing(this);
        this.setActive(false);
        this.setVisible(false);

        this.ghostTimer = 0;
        this.particleTimer = 0;
    }

    /**
     * 발사 초기화
     */
    launch(owner, target, config = {}) {
        this.owner = owner;
        this.damageMultiplier = config.damageMultiplier || 1.8;
        this.speed = config.speed || 1600;
        this.radius = config.radius || 150;
        this.isUltimate = config.isUltimate || false;

        // 도착 지점 설정
        if (target && target.x !== undefined) {
            this.targetPos = { x: target.x, y: target.y };
        } else if (config.targetPos) {
            this.targetPos = { x: config.targetPos.x, y: config.targetPos.y };
        }

        // 시작 지점: 대각선 하늘 (랜덤성 부여)
        const offsetX = Phaser.Math.Between(300, 600) * (Math.random() > 0.5 ? 1 : -1);
        const startX = this.targetPos.x + offsetX;
        const startY = this.targetPos.y - 1200;
        
        this.setPosition(startX, startY);
        this.setScale(config.scale || 2.2);
        
        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(1);

        // 레이어 설정 (fx 레이어: 엔티티보다 상위)
        this.setDepth(layerManager.getDepth('fx'));

        this.ghostTimer = 0;
        this.particleTimer = 0;
        this.isHitting = false;

        // 낙하 회전 설정 (머리가 먼저 떨어지도록 보정)
        // texture 기준 머리가 아래(PI/2)이므로, angle - PI/2를 해야 머리가 angle을 향함
        const angle = Phaser.Math.Angle.Between(startX, startY, this.targetPos.x, this.targetPos.y);
        this.setRotation(angle - Math.PI / 2);

        Logger.info("PROJECTILE", `Meteor ${this.isUltimate ? '(ULT)' : ''} falling correctly from ${offsetX > 0 ? 'Right' : 'Left'}`);
    }

    update(time, delta) {
        if (!this.active) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
        const moveDist = (this.speed * delta) / 1000;

        if (moveDist >= dist) {
            this.setPosition(this.targetPos.x, this.targetPos.y);
            this.hit();
        } else {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
            this.x += Math.cos(angle) * moveDist;
            this.y += Math.sin(angle) * moveDist;

            // 1. 잔상(Ghosting) 생성
            this.ghostTimer += delta;
            if (this.ghostTimer > 40) {
                ghostManager.spawnGhost(this, {
                    alpha: 0.3,
                    duration: 300,
                    tint: 0xff4400
                });
                this.ghostTimer = 0;
            }

            // 2. 붉은 파티클 트레일 (운석 꼬리 부분에서 나오도록 오프셋 계산)
            this.particleTimer += delta;
            if (this.particleTimer > 15) {
                // 오리진이 머리(0.9)로 바뀌었으므로, 꼬리는 진행 반대 방향으로 훨씬 멀리 있음
                // 대략 150px~200px 뒤쪽이 꼬리 지점
                const offsetAngle = angle - Math.PI; 
                const trailX = this.x + Math.cos(offsetAngle) * 180;
                const trailY = this.y + Math.sin(offsetAngle) * 180;

                phaserParticleManager.spawnRedMagic(trailX, trailY, 3);
                this.particleTimer = 0;
            }
        }
    }

    hit() {
        if (!this.active || this.isHitting) return;
        this.isHitting = true;

        // 범위 공격 판정 (충돌 즉시 발생)
        aoeManager.applyAOEDamagingEffect(
            this.owner, 
            this.x, 
            this.y, 
            this.radius, 
            this.damageMultiplier, 
            'magic',
            null,
            this.isUltimate
        );

        // 시각적 피드백: 폭발 발생
        phaserParticleManager.spawnExplosion(this.x, this.y);
        animationManager.playExplosion(this.x, this.y, this.isUltimate ? 2.0 : 1.2);

        if (this.scene.sound) {
            this.scene.sound.play('explosive_1', { volume: 0.7 });
        }

        if (this.scene.cameras && this.scene.cameras.main) {
            // this.scene.cameras.main.shake(this.isUltimate ? 300 : 200, this.isUltimate ? 0.025 : 0.012); // [USER 요청] 카메라 쉐이크 비활성화
        }

        // [USER 요청] 자연스러운 소멸 연출: 지면을 뚫고 들어가는 느낌 (Piercing Fade-out)
        // 오리진이 머리이므로, 이제 여기서부터 뚫고 들어감
        const angle = this.rotation + Math.PI / 2; 
        const pierceDist = 120; // 오리진 변경에 맞춰 더 깊게 파고들도록 조정
        
        this.scene.tweens.add({
            targets: this,
            x: this.x + Math.cos(angle) * pierceDist,
            y: this.y + Math.sin(angle) * pierceDist,
            alpha: 0,
            scale: this.scale * 0.7,
            duration: 400,
            ease: 'Cubic.out',
            onComplete: () => {
                this.isHitting = false;
                this.destroyProjectile();
            }
        });
    }

    destroyProjectile() {
        projectileManager.release(this);
    }
}
