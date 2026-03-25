import Logger from '../../../utils/Logger.js';
import { STAT_KEYS } from '../../../core/EntityConstants.js';

/**
 * 치명타 확률 증가 버프 (Critical Up Buff)
 * 역할: [아군의 치명타 확률을 일시적으로 상승]
 */
class CriticalUp {
    /**
     * 버프 설정값 반환
     * @param {number} value 증가할 확률 (0.2 = 20%)
     * @param {number} duration 지속 시간 (ms)
     */
    static getConfig(value = 0.2, duration = 8000) {
        return {
            id: 'critical_up',
            icon: 'critical_up', // IconManager에서 매핑될 키
            key: STAT_KEYS.CRIT,
            value: value,
            type: 'add',
            duration: duration
        };
    }

    /**
     * 버프 적용 (BuffManager를 통한 표준 방식)
     * @param {CombatEntity} target 
     * @param {number} value 
     * @param {number} duration 
     */
    static apply(target, value = 0.2, duration = 8000) {
        if (!target || !target.logic || !target.logic.buffs) return;
        
        const config = this.getConfig(value, duration);
        target.logic.buffs.addBuff(config);
        
        Logger.info("BUFF", `Critical Up applied to ${target.logic.name} (+${(value * 100).toFixed(0)}%)`);
    }
}

export default CriticalUp;
