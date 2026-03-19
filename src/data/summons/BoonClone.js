import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 분 분신 데이터 (Boon Clone Data)
 * 역할: [성기사의 분신 - 아군 보호 및 홀리 오라 제공]
 */
export default {
    className: ENTITY_CLASSES.HOLYKNIGHT,
    spriteKey: 'boon_sprite', // 본체와 동일한 스프라이트 사용
    baseStats: {
        [STAT_KEYS.MAX_HP]: 100,
        [STAT_KEYS.HP]: 100,
        [STAT_KEYS.ATK]: 10,
        [STAT_KEYS.M_ATK]: 15,
        [STAT_KEYS.DEF]: 10,
        [STAT_KEYS.M_DEF]: 12,
        [STAT_KEYS.SPEED]: 120,
        [STAT_KEYS.ATK_SPD]: 1.0,
        [STAT_KEYS.ATK_RANGE]: 60,
        [STAT_KEYS.RANGE_MIN]: 0,
        [STAT_KEYS.RANGE_MAX]: 70,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 95,
        [STAT_KEYS.EVA]: 10,
        [STAT_KEYS.CRIT]: 0.05,
        [STAT_KEYS.ULT_CHARGE]: 0,
        [STAT_KEYS.RES_FIRE]: 10,
        [STAT_KEYS.RES_ICE]: 10,
        [STAT_KEYS.RES_LIGHTNING]: 10,
        [STAT_KEYS.STAMINA]: 100,
        [STAT_KEYS.STAM_REGEN]: 20
    }
};
