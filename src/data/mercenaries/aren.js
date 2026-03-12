import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'aren',
    name: 'Aren',
    className: ENTITY_CLASSES.WARRIOR,
    isSpecial: false,
    skill: 'ChargeAttack',
    description: '메시아를 향한 충직한 전사. 고기를 좋아하고 야채를 못 먹음.',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 120,
        [STAT_KEYS.ATK]: 15,
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 12,
        [STAT_KEYS.M_DEF]: 8,
        [STAT_KEYS.SPEED]: 110,
        [STAT_KEYS.ATK_SPD]: 1.2,
        [STAT_KEYS.ATK_RANGE]: 50,  // 근접 공격 사거리 추가
        [STAT_KEYS.RANGE_MIN]: 20,
        [STAT_KEYS.RANGE_MAX]: 50,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 90,
        [STAT_KEYS.EVA]: 10,
        [STAT_KEYS.CRIT]: 0.05,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 0,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 0
    }
};
