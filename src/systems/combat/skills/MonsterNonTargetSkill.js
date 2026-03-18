import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';
import fxManager from '../../graphics/FXManager.js';
import aoeManager from '../AOEManager.js';
import Airborne from '../effects/Airborne.js';
import monsterPatternAnimationManager from '../../graphics/MonsterPatternAnimationManager.js';

/**
 * 몬스터 던지기 스킬 (Monster Non-Target Skill)
 * 역할: [들고 있는 몬스터를 투사체로 발사하고 착지 효과 적용]
 */
class MonsterNonTargetSkill {
    constructor() {
        this.projectileKey = 'monster_nontarget';
    }

    /**
     * 스킬 시전
     * @param {CombatEntity} owner 시전자 (엘리트)
     * @param {object} targetPos 목표 좌표
     */
    execute(owner, targetPos) {
        if (!owner || !owner.carriedEntity || !targetPos) return false;

        const monster = owner.carriedEntity;
        
        Logger.info("SKILL", `${owner.logic.name} is throwing ${monster.logic.name}!`);

        // 1. 투사체 발사
        projectileManager.fire(this.projectileKey, owner, targetPos, {
            carriedEntity: monster,
            speed: 600,
            damageMultiplier: 1.0,
            onImpact: (owner, proj, pos) => this.applyImpact(owner, proj, pos),
            // 스킬 데이터 전달을 위해 config에 보관
            thrownMonster: monster
        });

        // 2. 캐리어 상태 해제 (매니저를 통해 들기 상태 종료)
        // [중요] release를 호출하되, 몬스터의 isBeingCarried는 투사체가 끝날 때까지 유지되어야 함
        // 여기서는 캐리어에서만 떼어냄
        owner.isBusy = false;
        owner.carriedEntity = null;

        return true;
    }

    /**
     * 착지 시 효과 적용
     */
    applyImpact(owner, projectile, pos) {
        const monster = projectile.carriedEntity || projectile.config.thrownMonster;
        if (!monster) return;

        Logger.info("SKILL", `${monster.logic.name} landed at (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`);

        // [신규] 시각적 충격 효과 출력
        fxManager.showFallingImpact(pos.x, pos.y);

        // 1. 광역 데미지 (던져진 몬스터의 최대 체력 20% + 시전자 공격력 1.0배)
        const monsterMaxHp = monster.logic.getTotalMaxHp ? monster.logic.getTotalMaxHp() : 100;
        const bonusDamage = Math.floor(monsterMaxHp * 0.2);
        
        aoeManager.applyAOEDamagingEffect(
            owner,
            pos.x,
            pos.y,
            120, // 반경
            1.5, // 기본 계수 (시전자의 공격력 배율)
            'physical',
            (hitTarget) => {
                // 에어본 적용 (800ms)
                Airborne.apply(hitTarget, 800, 150, owner);
                
                // [FIX] 몬스터 체력 비례 보너스 데미지(20%) 추가 정산
                if (hitTarget.logic && hitTarget.takeDamage && bonusDamage > 0) {
                    const finalBonus = Math.max(1, bonusDamage);
                    hitTarget.takeDamage(finalBonus, owner, 'physical');
                    Logger.info("SKILL", `Bonus HP Damage applied: ${finalBonus} to ${hitTarget.logic.name} (Source: ${monster.logic.name} HP: ${monsterMaxHp})`);
                }
            }
        );

        // 2. 던져진 몬스터 페널티 (체력 절반 감소) 및 복귀
        if (monster.logic.isAlive) {
            const damage = Math.floor(monster.logic.hp * 0.5);
            monster.takeDamage(damage, owner); // 자가 데미지 형식(또는 환경 데미지)
            
            monster.isBeingCarried = false;
            if (monster.body) monster.body.setEnable(true);
            
            Logger.debug("SKILL", `${monster.logic.name} took fall damage and returned to combat.`);
        }
    }
}

const monsterNonTargetSkill = new MonsterNonTargetSkill();
export default monsterNonTargetSkill;
