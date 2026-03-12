import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

export default {
    id: 'lute',
    name: 'Lute',
    className: ENTITY_CLASSES.BARD,
    isSpecial: false,
    skill: 'SongOfProtection',
    description: '음치 음유시인. 열정적인 노래로 모든 아군에게 마법 공격력의 2.5배 보호막(5초)을 생성함.',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 100,
        [STAT_KEYS.ATK]: 12,
        [STAT_KEYS.M_ATK]: 12,
        [STAT_KEYS.DEF]: 10,
        [STAT_KEYS.M_DEF]: 10,
        [STAT_KEYS.SPEED]: 115,
        [STAT_KEYS.ATK_SPD]: 1.1,
        [STAT_KEYS.ATK_RANGE]: 150,
        [STAT_KEYS.RANGE_MIN]: 50,
        [STAT_KEYS.RANGE_MAX]: 200,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 85,
        [STAT_KEYS.EVA]: 12,
        [STAT_KEYS.CRIT]: 0.08,
        [STAT_KEYS.ULT_CHARGE]: 1.5, // 바드 보너스
        [STAT_KEYS.RES_FIRE]: 0,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 0
    }
};
