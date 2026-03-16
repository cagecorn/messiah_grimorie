import { STAT_KEYS } from '../../../core/EntityConstants.js';

/**
 * 화염 토템 (Fire Totem) - 주주의 시그니처 스킬 토템
 * 역할: [사거리 내의 적에게 강력한 파이어 버스트 발사]
 */
export default {
    id: 'fire_totem',
    name: 'Fire Totem',
    spriteKey: 'fire_totem_sprite',
    baseStats: {
        [STAT_KEYS.MAX_HP]: 100,
        [STAT_KEYS.HP]: 100,
        [STAT_KEYS.ATK]: 0,
        [STAT_KEYS.M_ATK]: 40, // 마스터 마법공격력 기반 계수 적용
        [STAT_KEYS.DEF]: 15,
        [STAT_KEYS.M_DEF]: 15,
        [STAT_KEYS.SPEED]: 0,
        [STAT_KEYS.ATK_SPD]: 0.8,
        [STAT_KEYS.ATK_RANGE]: 350,
        [STAT_KEYS.RANGE_MIN]: 0,
        [STAT_KEYS.RANGE_MAX]: 350,
        [STAT_KEYS.CAST_SPD]: 1.2,
        [STAT_KEYS.ACC]: 110,
        [STAT_KEYS.EVA]: 0,
        [STAT_KEYS.CRIT]: 0.1,
        [STAT_KEYS.ULT_CHARGE]: 0,
        [STAT_KEYS.RES_FIRE]: 50, // 불 저항 높음
        [STAT_KEYS.RES_ICE]: -20, // 얼음에 취약
        [STAT_KEYS.RES_LIGHTNING]: 0,
        [STAT_KEYS.STAMINA]: 0,
        [STAT_KEYS.STAM_REGEN]: 0
    }
};
