import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 루트 (Lute) - 음치 음유시인
 * 클래스: 바드 (Bard)
 * 특징: 아군 강화(Inspiration) 및 원거리 적 견제(Kiting)
 */
export default {
    id: 'lute',
    name: 'Lute',
    className: ENTITY_CLASSES.BARD,
    isSpecial: false,
    skill: 'SongOfProtection',
    ultimate: 'SummonSiren',
    description: '음치 음유시인. 열정적인 노래로 모든 아군에게 마법 공격력의 2.5배 보호막(5초)을 생성함.',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 100,
        [STAT_KEYS.ATK]: 15,
        [STAT_KEYS.M_ATK]: 20,
        [STAT_KEYS.DEF]: 10,
        [STAT_KEYS.M_DEF]: 12,
        [STAT_KEYS.SPEED]: 110,
        [STAT_KEYS.ATK_SPD]: 1.2,
        [STAT_KEYS.ATK_RANGE]: 350,   // 바드는 원거리
        [STAT_KEYS.RANGE_MIN]: 150,   // 카이팅을 위해 최소 거리 설정
        [STAT_KEYS.RANGE_MAX]: 400,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 90,
        [STAT_KEYS.EVA]: 15,
        [STAT_KEYS.CRIT]: 0.1,
        [STAT_KEYS.ULT_CHARGE]: 1.5, // 바드 보너스
        [STAT_KEYS.RES_FIRE]: 0,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 0
    }
};
