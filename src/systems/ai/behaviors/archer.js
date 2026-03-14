import Logger from '../../../utils/Logger.js';

/**
 * 아처 평타 로직 (Archer Basic Attack)
 * - 원거리 물리 데미지 (ATK) 기반
 */
export const executeArcherAttack = (attacker, target) => {
    if (!attacker.isAlive || !target.isAlive) return;

    const damage = attacker.getTotalAtk() * 1.0;
    target.takeDamage(damage);
    Logger.info("COMBAT", `[Archer] ${attacker.name} shot ${target.name} for ${damage.toFixed(1)} damage.`);
};
