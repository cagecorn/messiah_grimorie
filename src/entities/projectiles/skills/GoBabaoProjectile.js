import Phaser from 'phaser';
import NonTargetProjectile from '../NonTargetProjectile.js';
import Logger from '../../../utils/Logger.js';
import GoBabaoAnimation from '../../../systems/graphics/effects/GoBabaoAnimation.js';
import phaserParticleManager from '../../../systems/graphics/PhaserParticleManager.js';

/**
 * 가라 바바오! 투사체 (Go Babao Projectile)
 * 역할: [바바오를 태우고 전장을 종횡무진 누비는 팽이 투사체]
 */
export default class GoBabaoProjectile extends NonTargetProjectile {
    constructor(scene, x, y) {
        super(scene, x, y, null);
        this.carriedBabao = null;
        this.duration = 4000; // 4초 동안 지속
        this.timer = 0;
        this.hitTargets = new Set(); // 다단히트 방지용 (혹은 쿨타임 방식)
        this.hitCooldowns = new Map(); // target -> nextHitTime
        this.speed = 800;
        this.isPierce = true; // 무조건 관통
    }

    launch(owner, target, config = {}) {
        this.carriedBabao = config.babao;
        if (!this.carriedBabao) {
            this.destroyProjectile();
            return;
        }

        this.owner = owner;
        this.duration = config.duration || 4000;
        this.timer = this.scene.time.now + this.duration;

        // 바바오 장착
        this.carriedBabao.isBeingCarried = true;
        this.setPosition(this.carriedBabao.x, this.carriedBabao.y);
        this.add(this.carriedBabao);
        this.carriedBabao.setPosition(0, 0);

        if (this.carriedBabao.body) {
            this.carriedBabao.body.setEnable(false);
        }

        // 회전 애니메이션 시작
        this.spinTween = GoBabaoAnimation.startSpin(this.scene, this.carriedBabao);

        // 첫 번째 목표 설정
        super.launch(this.carriedBabao, target, config);
        
        Logger.info("ULTIMATE", "Go Babao Projectile Launched!");
    }

    onUpdate(time, delta) {
        if (!this.active || !this.carriedBabao) return;

        // 1. 지속 시간 체크
        if (time > this.timer) {
            this.onHitGround(); // 종료 및 해제
            return;
        }

        // 2. 부모 업데이트 (이동 로직 등)
        super.onUpdate(time, delta);

        // 3. 목표에 거의 도달했다면 새로운 목표 탐색 (Zipping 로직)
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
        if (dist < 30) {
            this.selectNextTarget();
        }

        // 4. 시각 효과 (잔상 및 먼지)
        if (time % 50 < 20) {
            GoBabaoAnimation.playGhosting(this, { alpha: 0.3, lifeTime: 400 });
            if (phaserParticleManager.spawnWhiteDust) {
                phaserParticleManager.spawnWhiteDust(this.x, this.y);
            }
        }
    }

    selectNextTarget() {
        const enemies = (this.owner.team === 'mercenary') ? this.scene.enemies : this.scene.allies;
        const aliveEnemies = enemies.filter(e => e.active && e.logic.isAlive);

        if (aliveEnemies.length > 0) {
            // 현재 타겟이 아닌 다른 무작위 적 선택
            const next = Phaser.Utils.Array.GetRandom(aliveEnemies);
            this.targetPos = { x: next.x, y: next.y };
            
            // 물리 엔진 속도 재설정 (NonTargetProjectile 내부 로직과 유사)
            const angle = Phaser.Math.Angle.Between(this.x, this.y, next.x, next.y);
            if (this.body) {
                this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
            }
        } else {
            // 적이 없으면 주변 배회
            this.targetPos = { 
                x: this.x + Phaser.Math.Between(-200, 200), 
                y: this.y + Phaser.Math.Between(-200, 200) 
            };
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetPos.x, this.targetPos.y);
            if (this.body) {
                this.body.setVelocity(Math.cos(angle) * (this.speed * 0.5), Math.sin(angle) * (this.speed * 0.5));
            }
        }
    }

    onHit(target) {
        const now = this.scene.time.now;
        const lastHit = this.hitCooldowns.get(target) || 0;

        // 다단히트 쿨다운 (0.3초마다 히트 가능)
        if (now - lastHit < 300) return;

        // 데미지 적용 (계수 1.0)
        if (this.owner && this.owner.logic) {
            const damage = this.owner.logic.getTotalMAtk() * 1.0;
            target.takeDamage(damage, 'magic', this.owner);
            this.hitCooldowns.set(target, now);
            
            // 히트 이펙트
            if (phaserParticleManager.spawnHitFlash) {
                phaserParticleManager.spawnHitFlash(target.x, target.y);
            }
        }
    }

    onHitGround() {
        if (!this.carriedBabao) {
            this.destroyProjectile();
            return;
        }

        const babao = this.carriedBabao;
        const scene = this.scene;

        // 애니메이션 중지
        if (this.spinTween) this.spinTween.stop();
        if (babao.sprite) babao.sprite.setAngle(0);

        // 장착 해제
        this.remove(babao);
        scene.add.existing(babao);
        babao.setPosition(this.x, this.y);
        babao.isBeingCarried = false;

        if (babao.body) {
            babao.body.setEnable(true);
            babao.body.reset(this.x, this.y);
        }

        this.carriedBabao = null;
        this.destroyProjectile();
        
        Logger.info("ULTIMATE", "Babao finished cleaning and returned to normal.");
    }

    destroyProjectile() {
        if (this.carriedBabao) {
            this.onHitGround(); // 비상 탈출
        }
        if (this.spinTween) this.spinTween.stop();
        super.destroyProjectile();
    }
}
