import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 용병 데이터: 분 (Boon)
 * 역할: [성기사 - 아군 치유 오라를 보유한 근접 서포터 겸 탱커]
 */
export default {
    id: 'boon',
    name: 'Boon',
    className: ENTITY_CLASSES.HOLYKNIGHT,
    isSpecial: false,
    skill: 'HolyAura',
    ultimate: 'ProveYourExistence', // 궁극기명 (추후 구현)
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 120,    // 전사보다 높은 초기 체력
        [STAT_KEYS.ATK]: 12,
        [STAT_KEYS.M_ATK]: 18,      // 마법 공격력 기반 힐링
        [STAT_KEYS.DEF]: 12,
        [STAT_KEYS.M_DEF]: 15,      // 높은 마법 방어력
        [STAT_KEYS.SPEED]: 110,     // 무거운 갑주로 인해 평균 수준
        [STAT_KEYS.ATK_SPD]: 0.9,
        [STAT_KEYS.ATK_RANGE]: 60,  // 근접 공격
        [STAT_KEYS.ACC]: 92,
        [STAT_KEYS.EVA]: 5,
        [STAT_KEYS.CRIT]: 0.05,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 10,
        [STAT_KEYS.RES_ICE]: 10,
        [STAT_KEYS.RES_LIGHTNING]: 10,
        [STAT_KEYS.STAMINA]: 80,
        [STAT_KEYS.STAM_REGEN]: 18
    }
};
