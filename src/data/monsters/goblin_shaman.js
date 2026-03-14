import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'goblin_shaman',
    name: 'Goblin Shaman',
    className: ENTITY_CLASSES.HEALER,
    isSpecial: false,
    description: '주책맞은 목소리로 노래를 불러 동료를 치유하는 고블린 주술사.',
    level: 1,
    exp: 0,
    dropTableId: 'goblin_shaman',
    baseRewardExp: 35,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 40,
        [STAT_KEYS.ATK]: 2,
        [STAT_KEYS.M_ATK]: 8,       // 다소 높은 마법 공격력
        [STAT_KEYS.DEF]: 1,
        [STAT_KEYS.M_DEF]: 5,
        [STAT_KEYS.SPEED]: 85,
        [STAT_KEYS.ATK_SPD]: 0.9,
        [STAT_KEYS.ATK_RANGE]: 200,
        [STAT_KEYS.RANGE_MIN]: 50,
        [STAT_KEYS.RANGE_MAX]: 250,
        [STAT_KEYS.CAST_SPD]: 0.8,
        [STAT_KEYS.ACC]: 80,
        [STAT_KEYS.EVA]: 10,
        [STAT_KEYS.CRIT]: 0.05,
        [STAT_KEYS.ULT_CHARGE]: 1.1,
        [STAT_KEYS.RES_FIRE]: 10,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 0
    }
};
