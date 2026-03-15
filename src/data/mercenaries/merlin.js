import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'merlin',
    name: 'Merlin',
    className: ENTITY_CLASSES.WIZARD,
    isSpecial: false,
    skill: 'Fireball',
    ultimate: 'MeteorStrike',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 75,
        [STAT_KEYS.ATK]: 3,
        [STAT_KEYS.M_ATK]: 25,
        [STAT_KEYS.DEF]: 4,
        [STAT_KEYS.M_DEF]: 12,
        [STAT_KEYS.SPEED]: 95,
        [STAT_KEYS.ATK_SPD]: 0.9,
        [STAT_KEYS.ATK_RANGE]: 400,
        [STAT_KEYS.RANGE_MIN]: 100,
        [STAT_KEYS.RANGE_MAX]: 450,
        [STAT_KEYS.CAST_SPD]: 0.8,
        [STAT_KEYS.ACC]: 90,
        [STAT_KEYS.EVA]: 5,
        [STAT_KEYS.CRIT]: 0.12,
        [STAT_KEYS.ULT_CHARGE]: 1.2,
        [STAT_KEYS.RES_FIRE]: 20, // 마법사 속성 저항
        [STAT_KEYS.RES_ICE]: 5,
        [STAT_KEYS.RES_LIGHTNING]: 5,
        [STAT_KEYS.STAMINA]: 60,
        [STAT_KEYS.STAM_REGEN]: 25
    }
};
