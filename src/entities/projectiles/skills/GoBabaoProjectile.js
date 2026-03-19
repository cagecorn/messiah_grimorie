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
        this.lastRetargetTime = 0; // [신규] 리타겟팅 간격 제어
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
        this.collisionRadius = 80; // [FIX] 팽이 덩치에 맞춰 충격 반경 확대

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
        this.isPierce = true; // [CRITICAL] 무조건 관통 유지 (explode 방지)
        const dummy = { x: startX, y: startY, team: owner.team, id: owner.id, logic: owner.logic };
        super.launch(dummy, target, config);
        
        this.isPierce = true; // super.launch 이후 다시 한 번 강제 (혹시 모를 덮어쓰기 방지)
        
        // super.launch 이후 위치 재고정
        this.setPosition(startX, startY);

        if (this.body) {
            this.body.setSize(80, 80);
            this.body.setBounce(0);
            this.body.setDrag(0);
        }

        // [신규] 초기 물리 속도 설정
        const initialAngle = Phaser.Math.Angle.Between(startX, startY, this.targetPos.x, this.targetPos.y);
        if (this.body) {
            this.body.setVelocity(Math.cos(initialAngle) * this.speed, Math.sin(initialAngle) * this.speed);
        }

        // 초기 타겟 설정 (zipToTarget에서 현재 타겟 제외용)
        const enemies = (owner.team === 'mercenary') ? this.scene.enemies : this.scene.allies;
        this.currentTargetEntity = this.scene.physics.closest(this, enemies);

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
        
        // [Safety] 속도가 너무 낮거나(어딘가 걸림) 목표에 도달했을 때만 리타겟팅
        const isStuck = this.body && this.body.speed < 50;
        const now = this.scene.time.now;

        if ((dist < 50 || isStuck) && (now - this.lastRetargetTime > 100)) {
            if (isStuck) Logger.warn("BABAO_ULT", "Projectile seems stuck. Forcing re-target.");
            this.selectNextTarget();
            this.lastRetargetTime = now;
        }

        // 4. 시각 효과 (잔상 및 먼지) - [BUFF] 빈도 상향 (50ms -> 30ms)
        if (time % 30 < 15) {
            // [FIX] 컨테이너 대신 실제 엔티티를 전달하여 GhostManager가 스프라이트를 찾을 수 있게 함
            GoBabaoAnimation.playGhosting(this.carriedBabao, { alpha: 0.4, lifeTime: 500 });
            if (phaserParticleManager.spawnWhiteDust) {
                phaserParticleManager.spawnWhiteDust(this.x, this.y);
            }
        }
    }

    selectNextTarget() {
        const enemies = (this.owner.team === 'mercenary') ? this.scene.enemies : this.scene.allies;
        
        // 1. 현재 타겟이 아닌 다른 살아있는 적들 우선 탐색
        let aliveEnemies = enemies.filter(e => e.active && e.logic.isAlive && e !== this.currentTargetEntity);

        // 2. 다른 적이 없다면 현재 타겟을 포함하여 살아있는 적 탐색 (1:1 보스전 등 대응)
        if (aliveEnemies.length === 0) {
            aliveEnemies = enemies.filter(e => e.active && e.logic.isAlive);
        }

        if (aliveEnemies.length > 0) {
            // 무작위 적 선택
            const next = Phaser.Utils.Array.GetRandom(aliveEnemies);
            this.currentTargetEntity = next; 
            this.targetPos = { x: next.x, y: next.y };
            
            // 물리 엔진 속도 재설정
            const angle = Phaser.Math.Angle.Between(this.x, this.y, next.x, next.y);
            if (this.body) {
                const velX = Math.cos(angle) * this.speed;
                const velY = Math.sin(angle) * this.speed;
                this.body.setVelocity(velX, velY);
                Logger.info("BABAO_ULT", `Zipping to target: ${next.logic.name} at (${Math.round(next.x)}, ${Math.round(next.y)}). Speed: ${this.speed}`);
            }
        } else {
            // 적이 없으면 주변 배회 (타겟 좌표를 조금 더 멀리 잡아 Jitter 방지)
            const angle = Math.random() * Math.PI * 2;
            const dist = 300;
            this.targetPos = { 
                x: this.x + Math.cos(angle) * dist, 
                y: this.y + Math.sin(angle) * dist 
            };
            
            if (this.body) {
                this.body.setVelocity(Math.cos(angle) * (this.speed * 0.7), Math.sin(angle) * (this.speed * 0.7));
                Logger.info("BABAO_ULT", "No enemies found. Wandering...");
            }
        }
    }

    onHit(target) {
        const now = this.scene.time.now;
        const lastHit = this.hitCooldowns.get(target) || 0;

        // 다단히트 쿨다운 (0.2초마다 히트 가능)
        if (now - lastHit < 200) return;

        // 데미지 적용 (계수 1.2)
        if (this.owner && this.owner.logic) {
            const damage = this.owner.logic.getTotalMAtk() * 1.2;
            Logger.debug("BABAO_PROJ", `Hit! ${target.logic.name} Damaged: ${damage.toFixed(1)}`);
            
            // [FIX] takeDamage 시그니처 수정 (amount, attacker)
            target.takeDamage(damage, this.owner);
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

        // 애니메이션 중지 및 스케일/각도 원복
        if (this.spinTween) this.spinTween.stop();
        if (babao.sprite) {
            babao.sprite.setAngle(0);
            babao.sprite.scaleX = Math.abs(babao.sprite.scaleX); // 반전 상태 가능성 차단
        }

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
