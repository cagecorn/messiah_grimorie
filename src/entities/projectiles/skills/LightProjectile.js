import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import projectileManager from '../../../systems/combat/ProjectileManager.js';
import combatManager from '../../../systems/CombatManager.js';
import instanceIDManager from '../../../utils/InstanceIDManager.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';

/**
 * 빛의 투사체 (Light Projectile)
 * 역할: [힐러 전용 일직선 추적 및 타격]
 * 
 * 특징:
 * 1. 포물선 없이 일직선 비행
 * 2. 3중 중첩(Layering) 연출 (ADD 모드)
 * 3. 방향에 따른 좌우 반전 및 회전
 */
export default class LightProjectile extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        
        this.owner = null;
        this.target = null;
        this.damageMultiplier = 1.0;
        this.speed = 600;
        
        // 3중 레이어 스프라이트 생성
        this.layers = [];
        for (let i = 0; i < 3; i++) {
            const sprite = scene.add.image(0, 0, 'light_projectile');
            sprite.setBlendMode(Phaser.BlendModes.ADD);
            sprite.setScale(0.5);
            // 시차 느낌을 위해 레이어별로 미세하게 다른 알파값
            sprite.setAlpha(1.0 - (i * 0.2));
            this.add(sprite);
            this.layers.push(sprite);
        }

        this.id = "";
        
        scene.add.existing(this);
        this.setActive(false);
        this.setVisible(false);
    }

    /**
     * 발사 초기화
     */
    launch(owner, target, config = {}) {
        this.owner = owner;
        this.target = target;
        this.damageMultiplier = config.damageMultiplier || 1.0;
        this.speed = config.speed || 700;
        
        this.id = instanceIDManager.generate(`proj_light_${owner.id}`);

        // 발사 위치 설정 (몸통 높이)
        this.setPosition(owner.x, owner.y - 40);
        
        this.setActive(true);
        this.setVisible(true);
        this.setAlpha(1);

        // 레이어 초기화
        this.layers.forEach((s, i) => {
            s.setScale(0.5);
            s.setAlpha(1.0 - (i * 0.2));
        });

        Logger.info("PROJECTILE", `Light Projectile ${this.id} fired from ${owner.logic.name}`);
    }

    update(time, delta) {
        if (!this.active || !this.target || !this.target.active) {
            if (this.active) this.destroyProjectile();
            return;
        }

        // 1. 타겟 추적 및 방향 계산
        const targetX = this.target.x;
        const targetY = this.target.y - 40;

        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

        // 2. 일직선 이동
        const moveDist = (this.speed * delta) / 1000;
        
        if (moveDist >= dist) {
            this.setPosition(targetX, targetY);
            this.hit();
        } else {
            const vx = Math.cos(angle) * moveDist;
            const vy = Math.sin(angle) * moveDist;
            this.x += vx;
            this.y += vy;

            // 3. 비주얼 업데이트 (회전 및 반전)
            // 원본 이미지가 왼쪽을 바라보고 있음
            if (targetX > this.owner.x) {
                this.setScale(1, 1); // 오른쪽 발사 시 반전 X (이미지가 왼쪽이니 반전을 해야 오른쪽인가? 아님, 이미지가 왼쪽이니 반전해야 오른쪽)
                // 잠깐, 이미지가 왼쪽이면 FlipX(true)가 오른쪽이어야 함.
                // ArrowProjectile 로직 참고: 오른쪽일 때 FlipX(true), Rotation(angle)
                this.iterate(child => {
                    child.setFlipX(true);
                    child.setRotation(angle);
                });
            } else {
                this.iterate(child => {
                    child.setFlipX(false);
                    child.setRotation(angle + Math.PI);
                });
            }

            // 레이어 미세 애니메이션 (반짝임)
            this.layers.forEach((s, i) => {
                s.setAlpha((1.0 - (i * 0.2)) * (0.8 + Math.sin(time * 0.01 + i) * 0.2));
            });
        }
    }

    hit() {
        if (this.target && this.target.logic.isAlive) {
            // 데미지 처리
            combatManager.processDamage(this.owner, this.target, {
                multiplier: this.damageMultiplier,
                projectileId: this.id
            }, 'magic');

            // 노란색 섬광 파티클
            phaserParticleManager.spawnMagicFlash(this.x, this.y);

            // 효과음 재생
            if (this.scene.sound) {
                this.scene.sound.play('magic_hit_1', { volume: 0.5 });
            }
        }
        
        this.destroyProjectile();
    }

    destroyProjectile() {
        projectileManager.release(this);
    }
}
