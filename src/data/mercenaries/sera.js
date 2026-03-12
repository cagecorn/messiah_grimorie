import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'sera',
    name: 'Sera',
    className: ENTITY_CLASSES.HEALER,
    isSpecial: false,
    skill: 'MassHeal',
    description: '입담이 거친 힐러. 유기동물을 사랑함.',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 90,
        [STAT_KEYS.ATK]: 5,
        [STAT_KEYS.M_ATK]: 20,
        [STAT_KEYS.DEF]: 8,
        [STAT_KEYS.M_DEF]: 15,
        [STAT_KEYS.SPEED]: 100,
        [STAT_KEYS.ATK_SPD]: 1.0,
        [STAT_KEYS.ATK_RANGE]: 300,
        [STAT_KEYS.RANGE_MIN]: 80,
        [STAT_KEYS.RANGE_MAX]: 350,
        [STAT_KEYS.CAST_SPD]: 1.2,
        [STAT_KEYS.ACC]: 100,
        [STAT_KEYS.EVA]: 8,
        [STAT_KEYS.CRIT]: 0.05,
        [STAT_KEYS.ULT_CHARGE]: 1.1,
        [STAT_KEYS.RES_FIRE]: 0,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 0
    }
};
