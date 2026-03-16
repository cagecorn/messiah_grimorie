import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'zayn',
    name: 'Zayn',
    className: ENTITY_CLASSES.ROGUE,
    isSpecial: false,
    skill: 'zayn', // SkillManager에서 zayn 키로 조회
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 100,
        [STAT_KEYS.ATK]: 22,
        [STAT_KEYS.M_ATK]: 5,
        [STAT_KEYS.DEF]: 6,
        [STAT_KEYS.M_DEF]: 12,
        [STAT_KEYS.SPEED]: 140,
        [STAT_KEYS.ATK_SPD]: 1.5,
        [STAT_KEYS.ATK_RANGE]: 45,
        [STAT_KEYS.RANGE_MIN]: 20,
        [STAT_KEYS.RANGE_MAX]: 45,
        [STAT_KEYS.CAST_SPD]: 1.2,
        [STAT_KEYS.ACC]: 95,
        [STAT_KEYS.EVA]: 30,
        [STAT_KEYS.CRIT]: 0.15,
        [STAT_KEYS.ULT_CHARGE]: 1.2,
        [STAT_KEYS.RES_FIRE]: 0,
        [STAT_KEYS.RES_ICE]: 10,
        [STAT_KEYS.RES_LIGHTNING]: 0,
        [STAT_KEYS.STAMINA]: 120,
        [STAT_KEYS.STAM_REGEN]: 12
    },
    // 궁극기 구색 맞추기
    ultimate: {
        id: 'cloning',
        name: 'Cloning',
        description: 'Creates mirror images of himself to confuse enemies.'
    }
};
