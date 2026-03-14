import Logger from '../../../utils/Logger.js';

/**
 * 전사 평타 로직 (Warrior Basic Attack)
 * - 물리 데미지 (ATK) 기반
 */
export const executeWarriorAttack = (attacker, target) => {
    if (!attacker.isAlive || !target.isAlive) return;

    const damage = attacker.getTotalAtk() * 1.2;
    target.takeDamage(damage);
    Logger.info("COMBAT", `[Warrior] ${attacker.name} attacked ${target.name} for ${damage.toFixed(1)} damage.`);
};
