import { ENTITY_CLASSES, STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 실비 (Silvi) - 전사 / 탱커
 * 역할: [강력한 방어력과 데미지 감소 스킬을 가진 메인 탱커]
 */
export default {
    id: 'silvi',
    name: 'Silvi',
    className: ENTITY_CLASSES.WARRIOR,
    isSpecial: false,
    skill: 'StoneSkin',
    ultimate: 'SilviUltimate',
    description: '어리숙해 보이지만 단단한 피부를 가진 양인 전사. "죄송합니다!"라며 적을 벤다.',
    level: 1,
    exp: 0,
    baseStats: {
        [STAT_KEYS.MAX_HP]: 150,      // 아렌(120)보다 높음
        [STAT_KEYS.ATK]: 12,          // 아렌(15)보다 낮음
        [STAT_KEYS.M_ATK]: 0,
        [STAT_KEYS.DEF]: 18,          // 아렌(12)보다 높음
        [STAT_KEYS.M_DEF]: 12,         // 아렌(8)보다 높음
        [STAT_KEYS.SPEED]: 90,        // 아렌(110)보다 느림 (중갑 컨셉)
        [STAT_KEYS.ATK_SPD]: 1.0,     // 아렌(1.2)보다 느림
        [STAT_KEYS.ATK_RANGE]: 50,
        [STAT_KEYS.RANGE_MIN]: 20,
        [STAT_KEYS.RANGE_MAX]: 50,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 95,
        [STAT_KEYS.EVA]: 5,
        [STAT_KEYS.CRIT]: 0.05,
        [STAT_KEYS.ULT_CHARGE]: 1.0,
        [STAT_KEYS.RES_FIRE]: 0,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 0
    }
};
