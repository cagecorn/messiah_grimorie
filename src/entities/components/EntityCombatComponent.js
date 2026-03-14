import Logger from '../../utils/Logger.js';
import { STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 엔티티 전투 컴포넌트 (Entity Combat Component)
 * 역할: [피격, 치유, 사망 처리 등 전투 로직 전담]
 */
export default class EntityCombatComponent {
    constructor(entity, combatManager, animationManager, fxManager, phaserParticleManager, soundManager, poolingManager) {
        this.entity = entity;
        this.combatManager = combatManager;
        this.animationManager = animationManager;
        this.fxManager = fxManager;
        this.phaserParticleManager = phaserParticleManager;
        this.soundManager = soundManager;
        this.poolingManager = poolingManager;

        this.syncLogic();
        this.attackCooldown = 0;
    }

    /**
     * 논리 데이터 동기화 (풀링 재사용 대응)
     */
    syncLogic() {
        this.logic = this.entity.logic;
    }

    /**
     * 전투 업데이트 (쿨다운 공제)
     */
    update(delta) {
        if (!this.logic.isAlive) return;

        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }
    }

    /**
     * 일반 공격 실행
     */
    attack(target) {
        if (!target || !target.logic.isAlive || this.attackCooldown > 0) return;
        if (this.entity.status && this.entity.status.isUnableToAct()) return;

        // [신규] 공격 방향에 따른 플립 설정
        const diffX = target.x - this.entity.x;
        if (diffX > 0) {
            this.entity.visual.setFlipX(true); // 오른쪽 응시
        } else if (diffX < 0) {
            this.entity.visual.setFlipX(false); // 왼쪽 응시
        }

        const atkSpd = this.logic.getTotalAtkSpd();
        this.attackCooldown = 1000 / Math.max(0.1, atkSpd);

        this.playAttackAnimation(target, () => {
            this.combatManager.executeNormalAttack(this.entity, target);
        });
    }

    /**
     * 공격 애니메이션 실행 브릿지
     */
    playAttackAnimation(target, onHit) {
        const className = this.logic.class.getClassName();
        const isMelee = className === 'warrior' || this.logic.type === 'monster';

        if (isMelee) {
            this.animationManager.playDashAttack(this.entity, target, onHit);
        } else {
            // 원거리 클래스는 대쉬 없이 제자리에서 공격
            this.entity.scene.time.delayedCall(100, onHit);
        }
    }

    /**
     * 데미지 처리
     */
    takeDamage(amount, attacker) {
        if (!this.logic.isAlive || this.logic.isDead) return;

        // [신규] 무적 상태 체크
        if (this.entity.status && this.entity.status.states.invincible) {
            Logger.info("COMBAT", `${this.logic.name} is INVINCIBLE! Damage ignored.`);
            return;
        }

        // [신규] 보호막 흡수 로직
        const absorbed = this.logic.shields ? this.logic.shields.absorbDamage(amount) : 0;
        let finalDamage = amount - absorbed;

        // [신규] 데미지 감소(DR) 적용
        const dr = this.logic.stats.bonusStats[STAT_KEYS.DR] || 0;
        finalDamage = finalDamage * (1 - Math.min(0.9, dr));

        let currentHp = this.logic.hp;
        if (finalDamage > 0) {
            // HP 직접 갱신 (BaseEntity에서 로직 이전)
            const current = this.logic.stats.finalStats[STAT_KEYS.HP];
            currentHp = Math.max(0, current - finalDamage);
            this.logic.stats.finalStats[STAT_KEYS.HP] = currentHp;
            
            // [신규] 수면 상태 해제 (공격 당할 시)
            if (this.logic.status && this.logic.status.states.sleep) {
                this.logic.status.states.sleep = false;
                if (this.logic.status.timers.sleep) {
                    clearTimeout(this.logic.status.timers.sleep);
                    this.logic.status.timers.sleep = null;
                }
                Logger.info("COMBAT", `${this.logic.name} woke up from damage!`);
            }
        }

        // HP바 갱신 알림
        if (this.entity.hpBar) {
            this.entity.hpBar.isDirty = true;
            this.entity.hpBar.shake();
        }

        // 시각 효과
        this.fxManager.flashRed(this.entity);
        this.phaserParticleManager.spawnBloodBurst(this.entity.x, this.entity.y - this.entity.zHeight - 40);

        if (currentHp <= 0) {
            this.handleDeath();
        }

        if (absorbed > 0) {
            Logger.info("COMBAT", `${this.logic.name} absorbed ${absorbed.toFixed(1)} damage. Final Damage: ${finalDamage.toFixed(1)}`);
        } else {
            Logger.info("COMBAT", `${this.logic.name} took ${amount} damage. Current HP: ${currentHp}`);
        }
    }

    /**
     * 회복 처리
     */
    heal(amount) {
        if (!this.logic.isAlive) return;
        
        // [수정] HP 직접 갱신 (BaseEntity에서 로직 이전)
        const current = this.logic.stats.finalStats[STAT_KEYS.HP];
        const max = this.logic.getTotalMaxHp();
        const nextHp = Math.min(max, current + amount);
        this.logic.stats.finalStats[STAT_KEYS.HP] = nextHp;

        if (this.entity.hpBar) this.entity.hpBar.isDirty = true;
    }

    /**
     * 사망 처리
     */
    handleDeath() {
        if (this.logic.isDead) return;
        this.logic.isDead = true;

        // 이동 중지 및 사운드 발생
        this.entity.stop();
        this.soundManager.playUnitFallen();

        // HUD 해제
        this.fxManager.detachHUD(this.entity);

        // 사망 애니메이션 및 풀링 반환
        this.animationManager.playDeathAnimation(this.entity, () => {
            if (this.entity.poolType) {
                this.poolingManager.release(this.entity.poolType, this.entity);
            } else {
                this.entity.destroy();
            }
        });
        Logger.system(`${this.logic.name} has fallen.`);
    }
}
