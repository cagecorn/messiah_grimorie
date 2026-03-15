import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import aoeManager from '../../../systems/combat/AOEManager.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';
import ghostManager from '../../../systems/graphics/GhostManager.js';
import layerManager from '../../../ui/LayerManager.js';
import animationManager from '../../../systems/graphics/AnimationManager.js';
import Logger from '../../../utils/Logger.js';

/**
 * 운석 투사체 (Meteor Projectile)
 * 역할: [하늘에서 대각선으로 떨어지는 거대 운석 연출 및 범위 타격]
 * 특성: 논타겟(Non-Target) - 특정 지점으로 낙하하며 지면 도달 시에만 폭발(고도 필터링).
 */
export default class MeteorProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, 'meteor_sprite');
        
        this.radius = 150;
        this.setOrigin(0.5, 0.9);
        this.setBlendMode(Phaser.BlendModes.NORMAL);
        this.damageType = 'magic';
    }

    onLaunch(config) {
        this.damageMultiplier = config.damageMultiplier || 1.8;
        this.speed = config.speed || 1600;
        this.radius = config.radius || 150;
        this.isUltimate = config.isUltimate || false;

        // 시작 지점 재설정 (하늘)
        const offsetX = Phaser.Math.Between(300, 600) * (Math.random() > 0.5 ? 1 : -1);
        const startX = this.targetPos.x + offsetX;
        const startY = this.targetPos.y - 1200;
        
        this.setPosition(startX, startY);
        this.setScale(config.scale || 2.2);

        // 회전 설정 (머리 방향)
        this.fallingAngle = Phaser.Math.Angle.Between(startX, startY, this.targetPos.x, this.targetPos.y);
        this.updateRotation(this.fallingAngle);

        this.ghostTimer = 0;
        this.particleTimer = 0;
        this.isHitting = false;
        
        Logger.info("PROJECTILE", `Meteor falling from ${offsetX > 0 ? 'Right' : 'Left'}`);
    }

    /**
     * 메테오의 특수한 '고도 필터링' 충돌 체크
     */
    checkCollisions() {
        // [USER 요청] 하늘에서는 충돌하지 않음. 
        // 목표 Y좌표(지면)로부터 100px 이내일 때만 충돌 판정 활성화
        const groundDist = Math.abs(this.y - this.targetPos.y);
        if (groundDist > 100) return;

        super.checkCollisions();
    }

    onUpdate(time, delta) {
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

        // 2. 붉은 파티클 트레일
        this.particleTimer += delta;
        if (this.particleTimer > 15) {
            // 위치 기반 실시간 각도가 아닌, 고정된 낙하 각도 사용 (지연/반전 방지)
            const angle = this.fallingAngle;
            const offsetAngle = angle - Math.PI; 
            const trailX = this.x + Math.cos(offsetAngle) * 180;
            const trailY = this.y + Math.sin(offsetAngle) * 180;

            phaserParticleManager.spawnRedMagic(trailX, trailY, 3);
            this.particleTimer = 0;
        }
    }

    /**
     * 메테오 전용 회전 로직 (Base class의 updateRotation 오버라이드)
     * 낙하 각도를 고정하여 지면 근처에서의 '각도 뒤집힘' 현상 방지
     */
    updateRotation(angle) {
        // 입력받은 angle이 아닌, 초기화된 fallingAngle을 우선 사용하거나 
        // 혹은 launch에서만 명시적으로 부름.
        const targetAngle = this.fallingAngle || angle;
        
        // 메테오는 머리 부분이 아래(PI/2)를 향하므로, 진행 방향(angle)에서 PI/2를 빼야 머리가 진행 방향을 향함
        this.setRotation(targetAngle - Math.PI / 2);
        this.setFlipX(false); 
    }

    /**
     * 지면에 닿았을 때 (폭발 연출)
     */
    onHitGround() {
        if (this.isHitting) return;
        this.isHitting = true;

        // 범위 공격 판정
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

        // 시각적 피드백
        phaserParticleManager.spawnExplosion(this.x, this.y);
        animationManager.playExplosion(this.x, this.y, this.isUltimate ? 2.0 : 1.2);

        if (this.scene.sound) {
            this.scene.sound.play('explosive_1', { volume: 0.7 });
        }

        // 지면을 뚫고 들어가는 연출 (소멸 타이밍 제어)
        this.pierceAndFade();
    }

    pierceAndFade() {
        // 이미 보정된 rotation을 기반으로 낙하 방향 계산
        const angle = this.fallingAngle; 
        const pierceDist = 120;
        
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

    explode() {
        // hitGround에서 직접 트윈 소멸을 관리하므로 기본 explode() 무시
    }
}
