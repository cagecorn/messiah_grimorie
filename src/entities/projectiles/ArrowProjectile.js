import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import projectileManager from '../../systems/combat/ProjectileManager.js';
import combatManager from '../../systems/CombatManager.js';
import instanceIDManager from '../../utils/InstanceIDManager.js';

/**
 * 화살 투사체 (Arrow Projectile)
 * 역할: [타겟 추적 및 포물선 비행 로직]
 */
export default class ArrowProjectile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        // 'arrow_projectile' 키는 AssetPathManager에서 로드된다고 가정
        super(scene, x, y, 'arrow_projectile');
        
        this.owner = null;
        this.target = null;
        this.damageMultiplier = 1.0;
        this.speed = 400;
        
        // 포물선 로직 관련
        this.elapsedTime = 0;
        this.duration = 0;
        this.startX = 0;
        this.startY = 0;
        this.peakHeight = 80; // 포물선 정점 높이
        
        this.setOrigin(0.5, 0.5);
        this.id = ""; // DamageCalculationManager 추적용 unique ID
    }

    /**
     * 발사 초기화
     */
    launch(owner, target, config = {}) {
        this.owner = owner;
        this.target = target;
        this.damageMultiplier = config.damageMultiplier || 1.0;
        this.speed = config.speed || 500;
        
        // 고유 ID 생성 (추적용)
        this.id = instanceIDManager.generate(`proj_arrow_${owner.id}`);

        this.setX(owner.x);
        this.setY(owner.y - 40); // 발사 지점 (몸통 높이)
        this.startX = this.x;
        this.startY = this.y;
        
        this.setActive(true);
        this.setVisible(true);
        this.elapsedTime = 0;

        // 거리 기반 비행 시간 계산
        const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        this.duration = (dist / this.speed) * 1000; // ms

        // 포물선 정점 조절 (거리에 비례)
        this.peakHeight = Math.min(150, dist * 0.3);

        Logger.info("PROJECTILE", `Fired ${this.id} from ${owner.logic.name} to ${target.logic.name}`);
    }

    update(time, delta) {
        if (!this.active || !this.target) return;

        this.elapsedTime += delta;
        const t = Math.min(1.0, this.elapsedTime / this.duration);

        // 1. 선형 보간 (Base XY)
        // 타겟의 현재 위치를 추적 (Moving Target)
        const targetX = this.target.x;
        const targetY = this.target.y - 40; // 타겟의 몸통 중심

        const currentX = Phaser.Math.Interpolation.Linear([this.startX, targetX], t);
        const currentY = Phaser.Math.Interpolation.Linear([this.startY, targetY], t);

        // 2. 포물선 오프셋 적용 (Quadratic ease-out/in)
        // parabola = 4 * peakHeight * t * (1 - t)
        const parabolaOffset = 4 * this.peakHeight * t * (1 - t);
        
        const nextX = currentX;
        const nextY = currentY - parabolaOffset;

        // 3. 방향 및 회전 (진행 방향 바라보기)
        const dx = nextX - this.x;
        const dy = nextY - this.y;
        const angle = Math.atan2(dy, dx);
        
        // [USER 요청] 항상 왼쪽을 바라보는 이미지 -> 오른쪽 발사 시 반전
        // 타겟 위치가 시전자보다 오른쪽이면 FlipX
        if (this.target.x > this.owner.x) {
            this.setFlipX(true);
            this.setRotation(angle); // 이미지 자체가 오른쪽(0)을 향하게 됨
        } else {
            this.setFlipX(false);
            this.setRotation(angle + Math.PI); // 다시 왼쪽(PI)을 향하게 됨
        }

        // [USER 요청] 궤도에 맞게 강제 왜곡 (Warp/Distortion)
        // 속력과 곡률에 따라 Squash & Stretch 적용
        const distToPrev = Math.sqrt(dx * dx + dy * dy);
        const stretch = 1.0 + Math.min(0.5, distToPrev / 20); // 속도가 빠를수록 길어짐
        const squash = 1.0 / stretch; // 부피 보존 느낌의 찌그러짐
        
        this.setScale(stretch * 0.5, squash * 0.5); // 기본 scale 0.5 반영

        this.setPosition(nextX, nextY);

        // 4. 도착 판정
        if (t >= 1.0) {
            this.hit();
        }
    }

    /**
     * 타격 처리
     */
    hit() {
        if (this.target && this.target.logic.isAlive) {
            // 데미지 계산 및 적용 (시전자를 공격자로 전달하여 스탯 반영)
            // 타격 순간에 CombatManager를 통해 데미지 프로세스 실행
            // Projectile ID를 넘겨서 DamageCalculationManager가 추적하게 함
            combatManager.processDamage(this.owner, this.target, {
                multiplier: this.damageMultiplier,
                projectileId: this.id // [신규] 투사체 ID 전달
            });
        }
        
        this.destroyProjectile();
    }

    destroyProjectile() {
        projectileManager.release(this);
    }
}
