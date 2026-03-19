import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 용병 데이터: 바오 (Bao)
 * 역할: [위자드 - 염력 바위 투척 원거리 광역 딜러]
 */
export default {
    id: 'bao',
    name: 'Bao',
    className: ENTITY_CLASSES.WIZARD,
    isSpecial: false,
    skill: 'StoneBlast',
    ultimate: 'Babao',
    level: 1,
    exp: 0,
    projectile: 'rock', // 전용 투사체 키
    baseStats: {
        [STAT_KEYS.MAX_HP]: 85,      // 곰 수인이라 메를린(75)보다 높음
        [STAT_KEYS.ATK]: 3,
        [STAT_KEYS.M_ATK]: 24,      // 메를린(25)보다 살짝 낮지만 광역 특화
        [STAT_KEYS.DEF]: 6,         // 곰 수인 방어력 보정
        [STAT_KEYS.M_DEF]: 10,
        [STAT_KEYS.SPEED]: 90,
        [STAT_KEYS.ATK_SPD]: 0.85,
        [STAT_KEYS.ATK_RANGE]: 380,
        [STAT_KEYS.RANGE_MIN]: 80,
        [STAT_KEYS.RANGE_MAX]: 420,
        [STAT_KEYS.CAST_SPD]: 0.75,
        [STAT_KEYS.ACC]: 88,
        [STAT_KEYS.EVA]: 4,
        [STAT_KEYS.CRIT]: 0.1,
        [STAT_KEYS.ULT_CHARGE]: 1.1,
        [STAT_KEYS.RES_FIRE]: 10,
        [STAT_KEYS.RES_ICE]: 10,
        [STAT_KEYS.RES_LIGHTNING]: 5,
        [STAT_KEYS.STAMINA]: 65,
        [STAT_KEYS.STAM_REGEN]: 22
    }
};
