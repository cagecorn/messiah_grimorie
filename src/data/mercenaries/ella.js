import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 용병: 엘라 (Ella)
 * 클래스: 아처 (Archer)
 * 특징: 원거리 물리 공격, 카이팅 AI
 */
export default {
    id: 'ella',
    name: 'Ella',
    className: ENTITY_CLASSES.ARCHER,
    isSpecial: false,
    skill: 'knockback_shot',
    description: '남자임에도 여자 이름을 지어주신 부모님을 원망하는 아처. 츤데레. 뜨개질 좋아함.',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 85,
        [STAT_KEYS.ATK]: 22,
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 6,
        [STAT_KEYS.M_DEF]: 6,
        [STAT_KEYS.SPEED]: 140,
        [STAT_KEYS.ATK_SPD]: 1.5,
        [STAT_KEYS.ATK_RANGE]: 380, // 기본 사거리
        [STAT_KEYS.RANGE_MIN]: 120, // 카이팅 시작 거리
        [STAT_KEYS.RANGE_MAX]: 400, // 최대 사거리
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 105,
        [STAT_KEYS.EVA]: 20,
        [STAT_KEYS.CRIT]: 0.15,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: -5,
        [STAT_KEYS.RES_ICE]: -5,
        [STAT_KEYS.RES_LIGHTNING]: -5
    }
};
