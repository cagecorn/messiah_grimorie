import Logger from '../../../utils/Logger.js';
import fxManager from '../../graphics/FXManager.js';
import animationManager from '../../graphics/AnimationManager.js';
import combatManager from '../../CombatManager.js';

/**
 * 바드 평타 로직 (Bard Dual Behavior)
 * 1순위: [영감] 아군 버프 (MATK 1.0 계수 기반 ATK/MATK 증가)
 * 2순위: [공격] 적 원거리 공격 (MATK 기반, 카이팅)
 */
export const executeBardAttack = (attacker, target) => {
    if (!attacker.isAlive || !target.isAlive) return;

    const isAlly = attacker.type === target.type;

    if (isAlly) {
        // [1순위: 영감 버프]
        // 1.0 MATK 기반 버프량 계산
        const buffAmount = attacker.getTotalMAtk() * 1.0;
        
        // 대상에게 [영감] 버프 부여 (Inspiration)
        if (target.buffs) {
            target.buffs.addBuff({
                id: `inspiration_${attacker.id}_${Date.now()}`,
                key: 'bonusAtk', // 요청에 따라 ATK와 MATK 모두 상향 가능하나, 일단 대표 stat 2개 적용
                value: buffAmount,
                type: 'add',
                duration: 5000 // 5초 지속
            });
            target.buffs.addBuff({
                id: `inspiration_matk_${attacker.id}_${Date.now()}`,
                key: 'bonusMAtk',
                value: buffAmount,
                type: 'add',
                duration: 5000
            });
        }

        // 시각 효과 (PooledInspiration)
        if (fxManager.showInspirationEffect) {
            fxManager.showInspirationEffect(target);
        }

        Logger.info("COMBAT", `[Bard] ${attacker.name} inspired ${target.name} (Buff: +${buffAmount.toFixed(1)})`);

        // [USER 요청] 적과 거리를 벌리는 로직은 AI Decision Tree에서 처리되거나 
        // 여기서 이동 명령을 살짝 섞어줄 수 있음. (일단은 로그 및 버프 우선)
    } else {
        // [2순위: 적 원거리 공격]
        // 바드는 투사체 발사 (projectile_bard)
        if (combatManager.fireProjectile) {
            combatManager.fireProjectile('bard', attacker.entity, target.entity, 1.0);
            Logger.info("COMBAT", `[Bard] ${attacker.name} fired a musical note at ${target.name}.`);
        }
    }
};
