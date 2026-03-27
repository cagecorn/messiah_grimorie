import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';
import TacticalCommand from '../../systems/combat/skills/TacticalCommand.js';
import BackInDays from '../../systems/combat/skills/BackInDays.js';

/**
 * 용병 데이터: 니클 (Nickle)
 * 역할: [아처 - 전술지휘를 통한 아군 평타 강화 및 왕년의 포텐셜을 폭발시키는 노련한 궁수]
 */
export default {
    id: 'nickle',
    name: 'Nickle',
    className: ENTITY_CLASSES.ARCHER,
    isSpecial: false,
    skill: TacticalCommand,
    ultimate: BackInDays,
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 105,      // 레오나보다 약간 높음 (노련함)
        [STAT_KEYS.ATK]: 20,         // 표준 물리 공격력
        [STAT_KEYS.M_ATK]: 5,
        [STAT_KEYS.DEF]: 12,
        [STAT_KEYS.M_DEF]: 12,
        [STAT_KEYS.SPEED]: 110,      // 약간 느리지만 안정적
        [STAT_KEYS.ATK_SPD]: 1.05,
        [STAT_KEYS.ATK_RANGE]: 350,   // 사거리 약간 김
        [STAT_KEYS.ACC]: 115,        // 명중률 매우 높음
        [STAT_KEYS.EVA]: 10,
        [STAT_KEYS.CRIT]: 0.12,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 10,
        [STAT_KEYS.RES_ICE]: 10,
        [STAT_KEYS.RES_LIGHTNING]: 10,
        [STAT_KEYS.STAMINA]: 100,
        [STAT_KEYS.STAM_REGEN]: 14,
        rangeMin: 100,
        rangeMax: 350
    }
};
