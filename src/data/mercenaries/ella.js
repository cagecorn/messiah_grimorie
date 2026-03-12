import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'ella',
    name: 'Ella',
    className: ENTITY_CLASSES.ARCHER,
    isSpecial: false,
    skill: 'KnockbackShot',
    description: '남자임에도 여자 이름을 지어주신 부모님을 원망하는 아처. 츤데레. 뜨개질 좋아함.',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 80,
        [STAT_KEYS.ATK]: 18,
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 5,
        [STAT_KEYS.M_DEF]: 5,
        [STAT_KEYS.SPEED]: 130,
        [STAT_KEYS.ATK_SPD]: 1.5,
        [STAT_KEYS.ATK_RANGE]: 350,
        [STAT_KEYS.RANGE_MIN]: 50,
        [STAT_KEYS.RANGE_MAX]: 400,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 95,
        [STAT_KEYS.EVA]: 15,
        [STAT_KEYS.CRIT]: 0.1,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: -5,  // 원거리 유닛 패널티
        [STAT_KEYS.RES_ICE]: -5,
        [STAT_KEYS.RES_LIGHTNING]: -5
    }
};
