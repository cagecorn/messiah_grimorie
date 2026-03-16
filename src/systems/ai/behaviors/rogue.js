import Logger from '../../../utils/Logger.js';

/**
 * 로그 평타 로직 (Rogue Basic Attack)
 * - 높은 물리 데미지 (ATK) 기반
 * - 치명타율 보정
 */
export const executeRogueAttack = (attacker, target) => {
    if (!attacker.isAlive || !target.isAlive) return;

    const stats = attacker.stats;
    const baseAtk = attacker.getTotalAtk();
    const critRate = stats.get('crit') || 0;
    
    // 치명타 계산
    const isCrit = Math.random() < critRate;
    let damage = baseAtk * 1.5; // 로그는 기본 배율이 높음 (1.5배)
    
    if (isCrit) {
        damage *= 2.0; // 치명타 2배
        Logger.info("COMBAT", `[Rogue] CRITICAL HIT! ${attacker.name} -> ${target.name} for ${damage.toFixed(1)} damage.`);
    } else {
        Logger.info("COMBAT", `[Rogue] ${attacker.name} attacked ${target.name} for ${damage.toFixed(1)} damage.`);
    }

    target.takeDamage(damage);
};
