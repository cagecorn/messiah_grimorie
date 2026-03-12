import Logger from '../../../utils/Logger.js';

/**
 * 위자드 평타 로직 (Wizard Basic Attack)
 * - 원거리 마법 데미지 (MATK) 기반
 */
export const executeWizardAttack = (attacker, target) => {
    if (!attacker.isAlive || !target.isAlive) return;

    const damage = attacker.getTotalMAtk();
    target.stats.takeDamage(damage);
    
    Logger.info("COMBAT", `[Wizard] ${attacker.name} cast a magic burst at ${target.name} for ${damage.toFixed(1)} magic damage.`);
};
