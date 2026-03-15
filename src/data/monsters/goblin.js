import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'goblin',
    name: 'Goblin',
    className: ENTITY_CLASSES.WARRIOR,
    isSpecial: false,
    skill: 'BasicSwing',
    description: '어디에나 있는 흔한 고블린. 약하지만 끈질깁니다.',
    level: 1,
    exp: 0,
    dropTableId: 'goblin_common',
    baseRewardExp: 7,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 50,    // 저조한 체력
        [STAT_KEYS.ATK]: 5,        // 저조한 공격력
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 2,
        [STAT_KEYS.M_DEF]: 1,
        [STAT_KEYS.SPEED]: 90,
        [STAT_KEYS.ATK_SPD]: 0.8,
        [STAT_KEYS.ATK_RANGE]: 40,
        [STAT_KEYS.RANGE_MIN]: 15,
        [STAT_KEYS.RANGE_MAX]: 40,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 70,
        [STAT_KEYS.EVA]: 5,
        [STAT_KEYS.CRIT]: 0.01,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 0,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 0,
        [STAT_KEYS.STAMINA]: 80,
        [STAT_KEYS.STAM_REGEN]: 10
    }
};
