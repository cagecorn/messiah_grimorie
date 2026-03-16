import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'joojoo',
    name: 'Joojoo',
    className: ENTITY_CLASSES.TOTEMIST,
    isSpecial: true,
    skill: 'FireTotem',
    ult: 'HealingTotem',
    description: "세상을 탐험하고 싶어서 정글을 뛰쳐나온 토템술사. 아직은 사회에 적응하기 낯설다.",
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 180,
        [STAT_KEYS.ATK]: 5,
        [STAT_KEYS.M_ATK]: 25,
        [STAT_KEYS.DEF]: 15,
        [STAT_KEYS.M_DEF]: 15,
        [STAT_KEYS.SPEED]: 60,  // 매우 느림 (치명적 단점)
        [STAT_KEYS.ATK_SPD]: 0.8, // 설치 속도
        [STAT_KEYS.ATK_RANGE]: 350,
        [STAT_KEYS.RANGE_MIN]: 200,
        [STAT_KEYS.RANGE_MAX]: 400,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 100,
        [STAT_KEYS.EVA]: 5,
        [STAT_KEYS.CRIT]: 0.05,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 20,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 0,
        [STAT_KEYS.STAMINA]: 120,
        [STAT_KEYS.STAM_REGEN]: 15
    }
};
