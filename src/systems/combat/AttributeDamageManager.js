import Logger from '../../utils/Logger.js';
import { STAT_KEYS } from '../../core/StatSchema.js';

/**
 * 속성 데미지 매니저 (Attribute Damage Manager)
 * 역할: [속성 저항에 따른 최종 데미지 보정]
 */
class AttributeDamageManager {
    constructor() {
        // 속성(Attribute)과 저항(Stat Key) 매핑
        this.resMap = {
            'fire': STAT_KEYS.RES_FIRE,
            'ice': STAT_KEYS.RES_ICE,
            'lightning': STAT_KEYS.RES_LIGHTNING
        };
    }

    /**
     * 속성 저항을 적용한 최종 데미지 계산
     * @param {CombatEntity} attacker 공격자
     * @param {CombatEntity} target 피격자
     * @param {number} baseDamage 기본 계산 데미지
     * @param {string} attribute 속성 ('fire', 'ice', 'lightning', 'none' 등)
     * @returns {number} 보정된 데미지
     */
    calculateDamage(attacker, target, baseDamage, attribute = 'none') {
        if (!attribute || attribute === 'none' || !this.resMap[attribute]) {
            return baseDamage;
        }

        const resKey = this.resMap[attribute];
        // target.logic.stats.get(resKey)를 통해 최종 저항값 획득
        const resValue = (target.logic && target.logic.stats) ? (target.logic.stats.get(resKey) || 0) : 0;

        // 데미지 계산 공식: Damage * (1 - Resistance / 100)
        // 저항 100 당 100% 감소 (최소 데미지 0 보장)
        const reduction = Math.min(1, resValue / 100);
        const finalDamage = Math.max(0, baseDamage * (1 - reduction));

        if (resValue !== 0) {
            Logger.debug("COMBAT_ATTR", `[${attribute.toUpperCase()}] ${attacker.logic.name} -> ${target.logic.name} | Base: ${baseDamage.toFixed(1)}, Res: ${resValue}%, Final: ${finalDamage.toFixed(1)}`);
        }

        return finalDamage;
    }
}

const attributeDamageManager = new AttributeDamageManager();
export default attributeDamageManager;
