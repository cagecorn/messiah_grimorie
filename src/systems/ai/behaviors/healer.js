import Logger from '../../../utils/Logger.js';

/**
 * 힐러 평타 로직 (Healer Dual Behavior)
 * - 아군에게는 힐 (MATK 기반)
 * - 적에게는 물리/마법 원거리 공격
 */
export const executeHealerAttack = (attacker, target) => {
    if (!attacker.isAlive || !target.isAlive) return;

    const isAlly = attacker.type === target.type;

    if (isAlly) {
        // 1. [힐 모드] 아군에게 힐
        const healAmount = attacker.getTotalMAtk() * 1.0;
        target.stats.heal(healAmount);
        Logger.info("COMBAT", `[Healer] ${attacker.name} healed ${target.name} for ${healAmount.toFixed(1)}.`);
    } else {
        // 2. [공격 모드] 적에게 마법 원거리 평타
        const damage = attacker.getTotalMAtk() * 0.8;
        target.stats.takeDamage(damage);
        Logger.info("COMBAT", `[Healer] ${attacker.name} shot ${target.name} for ${damage.toFixed(1)} magic damage.`);
    }
};
