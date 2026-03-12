import Logger from '../../../utils/Logger.js';

/**
 * 바드 평타 로직 (Bard Dual Behavior)
 * - 아군에게는 버프/보호막
 * - 적에게는 마법 원거리 공격
 */
export const executeBardAttack = (attacker, target) => {
    if (!attacker.isAlive || !target.isAlive) return;

    const isAlly = attacker.type === target.type;

    if (isAlly) {
        // 1. [버프/보호막 모드]
        // 예시: 5초간 공격 속도 10% 증가 버프
        attacker.buffs.addBuff({
            key: 'atkSpd',
            value: 0.1,
            type: 'mult',
            duration: 5000,
            id: `bard_buff_${attacker.id}`
        });
        Logger.info("COMBAT", `[Bard] ${attacker.name} buffed ${target.name}'s AtkSpd.`);
    } else {
        // 2. [공격 모드]
        const damage = attacker.getTotalMAtk() * 0.7;
        target.stats.takeDamage(damage);
        Logger.info("COMBAT", `[Bard] ${attacker.name} sang a sonic blast at ${target.name} for ${damage.toFixed(1)} magic damage.`);
    }
};
