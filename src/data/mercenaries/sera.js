import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'sera',
    name: 'Sera',
    className: ENTITY_CLASSES.HEALER,
    isSpecial: false,
    skill: 'MassHeal',
    ultimate: 'SummonGuardianAngel',
    description: '전장의 성녀. 아군의 상처를 누구보다 먼저 발견하고 치유합니다.',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 85,
        [STAT_KEYS.ATK]: 5,
        [STAT_KEYS.M_ATK]: 18,
        [STAT_KEYS.DEF]: 6,
        [STAT_KEYS.M_DEF]: 14,
        [STAT_KEYS.SPEED]: 105,
        [STAT_KEYS.ATK_SPD]: 0.9,     
        [STAT_KEYS.ATK_RANGE]: 400,   
        [STAT_KEYS.RANGE_MIN]: 200,   
        [STAT_KEYS.RANGE_MAX]: 400,
        [STAT_KEYS.CAST_SPD]: 1.2,
        [STAT_KEYS.ACC]: 100,
        [STAT_KEYS.EVA]: 12,
        [STAT_KEYS.CRIT]: 0.08,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 10,
        [STAT_KEYS.RES_ICE]: 10,
        [STAT_KEYS.RES_LIGHTNING]: 10
    }
};
