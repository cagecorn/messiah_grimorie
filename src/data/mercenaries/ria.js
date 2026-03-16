import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'ria',
    name: 'Ria',
    className: ENTITY_CLASSES.SWORDMASTER,
    isSpecial: false,
    skill: 'WindBlade', // 추후 패링 완료 후 구현
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 100,
        [STAT_KEYS.ATK]: 17,
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 10,
        [STAT_KEYS.M_DEF]: 10,
        [STAT_KEYS.SPEED]: 125,
        [STAT_KEYS.ATK_SPD]: 1.4,
        [STAT_KEYS.ATK_RANGE]: 80, 
        [STAT_KEYS.RANGE_MIN]: 20,
        [STAT_KEYS.RANGE_MAX]: 80,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 95,
        [STAT_KEYS.EVA]: 15,
        [STAT_KEYS.CRIT]: 0.1,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 0,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 0,
        [STAT_KEYS.STAMINA]: 150,
        [STAT_KEYS.STAM_REGEN]: 15
    }
};
