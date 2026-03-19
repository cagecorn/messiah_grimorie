import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';
import BloodRage from '../../systems/combat/skills/BloodRage.js';
import MagentaDrive from '../../systems/combat/skills/MagentaDrive.js';

/**
 * 용병 데이터: 킹 (King)
 * 역할: [전사 - 블러드 레이지를 통한 폭발적인 공격력을 보유한 근접 딜러]
 */
export default {
    id: 'king',
    name: 'King',
    className: ENTITY_CLASSES.WARRIOR, // 본거지는 전사 클래스
    isSpecial: false,
    skill: BloodRage,
    ultimate: MagentaDrive,
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 110,
        [STAT_KEYS.ATK]: 18,        // 높은 물리 공격력
        [STAT_KEYS.M_ATK]: 5,
        [STAT_KEYS.DEF]: 14,
        [STAT_KEYS.M_DEF]: 8,
        [STAT_KEYS.SPEED]: 120,    // 전사보다 살짝 빠름
        [STAT_KEYS.ATK_SPD]: 1.0,  // 표준 공속
        [STAT_KEYS.ATK_RANGE]: 65,
        [STAT_KEYS.ACC]: 95,
        [STAT_KEYS.EVA]: 8,
        [STAT_KEYS.CRIT]: 0.1,     // 치명타 확률 조금 더 높음
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 15,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 5,
        [STAT_KEYS.STAMINA]: 100,
        [STAT_KEYS.STAM_REGEN]: 20
    }
};
