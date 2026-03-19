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

        const babao = this.carriedBabao;
        this.owner = owner;
        this.duration = config.duration || 4000;
        this.timer = this.scene.time.now + this.duration;

        // [중요] 부모 컨테이너가 바뀌기 전의 절대 좌표 백업 (텔레포트 버그 방지)
        const startX = babao.x;
        const startY = babao.y;
        this.setPosition(startX, startY);

        // 1. 바바오를 컨테이너 자식으로 편입 (좌표는 0,0 고정)
        babao.isBeingCarried = true;
        this.add(babao);
        babao.setPosition(0, 0);

        if (babao.body) {
            babao.body.setEnable(false);
        }

        // 2. 부모 클래스 초기화 (Dummy 객체 활용하여 좌표 보존)
        this.isPierce = true; // 유닛 보호를 위해 관통 강제
        const dummy = { x: startX, y: startY, team: owner.team, id: owner.id, logic: owner.logic };
        super.launch(dummy, target, config);
        
        // super.launch 이후 위치 재고정
        this.setPosition(startX, startY);

        // [신규] 초기 물리 속도 설정 (super.launch가 수동 이동 기반이라 직접 설정 필요)
        const initialAngle = Phaser.Math.Angle.Between(startX, startY, this.targetPos.x, this.targetPos.y);
        if (this.body) {
            this.body.setVelocity(Math.cos(initialAngle) * this.speed, Math.sin(initialAngle) * this.speed);
        }

        // 회전 애니메이션 시작 (아이들링 바빙 중지 우선 및 기존 트윈 제거)
        babao.isBusy = true;
        this.scene.tweens.killTweensOf([babao, babao.sprite]); // [FIX] 구르기 등 기존 트윈 제거
        if (this.scene.animationManager) this.scene.animationManager.stopIdleBobbing(babao);
        this.spinTween = GoBabaoAnimation.startSpin(this.scene, babao);
        
        Logger.info("ULTIMATE", `Go Babao Projectile Launched at (${this.x.toFixed(1)}, ${this.y.toFixed(1)})`);
    }

    /**
     * [FIX] NonTargetProjectile의 수동 이동 로직이 물리 엔진과 충돌하는 것을 방지하기 위해 override
     */
    update(time, delta) {
        if (!this.active) return;

        // [FIX] 물리 엔진을 사용할 때는 super.update를 호출하지 않고 onUpdate에서 직접 관리
        if (this.body && this.body.enable) {
            this.onUpdate(time, delta);
        } else {
            super.update(time, delta);
        }
    }

    onUpdate(time, delta) {
        if (!this.active || !this.carriedBabao) return;

        // 1. 지속 시간 체크
        if (time > this.timer) {
            this.onHitGround(); // 종료 및 해제
            return;
        }

        // 2. 부모 업데이트 (이동 로직 등)
        // [FIX] 물리 엔진을 사용 중일 때는 NonTargetProjectile의 x/y 직접 가산 로직을 우회하거나 속도를 0으로 만들어야 함.
        // 여기서는 launch 시 usePhysics가 설정되었다면 super.onUpdate를 호출하되 
        // NonTargetProjectile.update에서 수행하는 manual movement와의 충돌을 피하기 위해
        // selectNextTarget에서 직접 setVelocity를 관리함.
        if (this.body && this.body.enable) {
            // 물리 기반 이동 시에는 super.onUpdate 생략 (충돌 체크와 selectNextTarget은 직접 수행)
            this.checkCollisions();
        } else {
            super.onUpdate(time, delta);
        }

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
        babao.isBusy = false; // [FIX] 상태 해제

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
