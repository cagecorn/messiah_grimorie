import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'silvi',
    name: 'Silvi',
    className: ENTITY_CLASSES.WARRIOR,
    isSpecial: false,
    skill: 'StoneSkin',
    description: '가난한 부모님을 돕기 위해 싸우는 소녀 전사. 겁이 많음.',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 150, // 탱킹 특화로 높은 체력
        [STAT_KEYS.ATK]: 10,
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 20,    // 탱킹 특화로 높은 방어력
        [STAT_KEYS.M_DEF]: 15,
        [STAT_KEYS.SPEED]: 90,
        [STAT_KEYS.ATK_SPD]: 0.8,
        [STAT_KEYS.ATK_RANGE]: 40, // 근접 공격 사거리 추가
        [STAT_KEYS.RANGE_MIN]: 15,
        [STAT_KEYS.RANGE_MAX]: 40,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 85,
        [STAT_KEYS.EVA]: 5,
        [STAT_KEYS.CRIT]: 0.02,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 10,  // 탱커 기본 저항력
        [STAT_KEYS.RES_ICE]: 10,
        [STAT_KEYS.RES_LIGHTNING]: 10
    }
};
