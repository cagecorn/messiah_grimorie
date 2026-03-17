import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'flyingman',
    name: 'Flying Man',
    className: ENTITY_CLASSES.FLYINGMAN,
    isSpecial: true,
    skill: 'Fireball', // 임시로 Fireball 부여
    ultimate: 'MeteorStrike',
    projectile: 'bullet',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 100,
        [STAT_KEYS.ATK]: 5,
        [STAT_KEYS.M_ATK]: 15,
        [STAT_KEYS.DEF]: 10,
        [STAT_KEYS.M_DEF]: 15,
        [STAT_KEYS.SPEED]: 110,
        [STAT_KEYS.ATK_SPD]: 1.0,
        [STAT_KEYS.ATK_RANGE]: 350,
        [STAT_KEYS.RANGE_MIN]: 150,
        [STAT_KEYS.RANGE_MAX]: 400,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 100,
        [STAT_KEYS.EVA]: 20,
        [STAT_KEYS.CRIT]: 0.1,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.STAMINA]: 100,
        [STAT_KEYS.STAM_REGEN]: 20
    }
};
