/**
 * 스태미나 회복 효율 상승 (Stamina Regen Up Buff)
 * 역할: [유닛의 스태미나 회복 속도를 일시적으로 상승]
 */
export default class StaminaRegenUp {
    /**
     * @param {CombatEntity} target 
     * @param {number} duration 지속 시간 (ms)
     * @param {number} value 배율 (0.5 = 50% 증가)
     */
    static apply(target, duration, value = 0.5) {
        if (!target || !target.logic || !target.logic.buffs) return;

        target.logic.buffs.addBuff({
            id: 'stamina_up',
            icon: 'stamina_up',
            key: 'stamRegen',
            value: value,
            type: 'mult',
            duration: duration
        });
    }
}
