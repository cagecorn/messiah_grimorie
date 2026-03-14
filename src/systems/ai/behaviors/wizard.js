import Logger from '../../../utils/Logger.js';

/**
 * 위자드 평타 로직 (Wizard Basic Attack)
 * - 원거리 마법 데미지 (MATK) 기반
 */
export const executeWizardAttack = (attacker, target) => {
    if (!attacker.isAlive || !target.isAlive) return;

    const damage = attacker.getTotalMAtk() * 1.5;
    target.takeDamage(damage);
    Logger.info("COMBAT", `[Wizard] ${attacker.name} cast Fireball on ${target.name} for ${damage.toFixed(1)} damage.`);
};
