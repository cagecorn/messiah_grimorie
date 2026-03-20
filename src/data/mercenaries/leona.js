import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';
import ElectricGrenade from '../../systems/combat/skills/ElectricGrenade.js';
import CarpetBombing from '../../systems/combat/skills/CarpetBombing.js';

/**
 * 용병 데이터: 레오나 (Leona)
 * 역할: [아처 - 전기 수류탄을 통한 광역 기절 및 융단폭격을 지원하는 생존주의자]
 */
export default {
    id: 'leona',
    name: 'Leona',
    className: ENTITY_CLASSES.ARCHER,
    isSpecial: false,
    skill: ElectricGrenade,
    ultimate: CarpetBombing,
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 95,
        [STAT_KEYS.ATK]: 22,         // 높은 물리 공격력
        [STAT_KEYS.M_ATK]: 5,
        [STAT_KEYS.DEF]: 10,
        [STAT_KEYS.M_DEF]: 10,
        [STAT_KEYS.SPEED]: 115,
        [STAT_KEYS.ATK_SPD]: 1.1,    // 아처답게 빠른 공속
        [STAT_KEYS.ATK_RANGE]: 320,  // 표준 원거리 사거리
        [STAT_KEYS.ACC]: 110,        // 높은 명중률
        [STAT_KEYS.EVA]: 15,         // 생존주의자다운 회피
        [STAT_KEYS.CRIT]: 0.15,      // 치명타 확률 높음
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 10,
        [STAT_KEYS.RES_ICE]: 10,
        [STAT_KEYS.RES_LIGHTNING]: 30, // 전기 저항 높음
        [STAT_KEYS.STAMINA]: 100,
        [STAT_KEYS.STAM_REGEN]: 15,
        rangeMin: 120,               // 카이팅 최소 거리
        rangeMax: 320                // 카이팅 최대 거리
    }
};
