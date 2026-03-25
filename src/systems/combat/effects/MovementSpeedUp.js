/**
 * 이동 속도 보너스 (Movement Speed Up Buff)
 * 역할: [유닛의 이동 속도를 일시적으로 상승]
 */
export default class MovementSpeedUp {
    /**
     * @param {CombatEntity} target 
     * @param {number} duration 지속 시간 (ms)
     * @param {number} value 배율 (0.3 = 30% 증가)
     */
    static apply(target, duration, value = 0.3) {
        if (!target || !target.logic || !target.logic.buffs) return;

        target.logic.buffs.addBuff({
            id: 'movement_up',
            icon: 'movement_up',
            key: 'speed',
            value: value,
            type: 'mult',
            duration: duration
        });
    }
}
