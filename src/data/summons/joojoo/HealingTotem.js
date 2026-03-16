import { ENTITY_CLASSES, STAT_KEYS } from '../../../core/EntityConstants.js';

/**
 * 치유 토템 (Healing Totem) - 주주의 궁극기 토템
 * 역할: [광범위한 아군에게 매스 힐 시전]
 */
export default {
    id: 'healing_totem',
    name: 'Healing Totem',
    className: ENTITY_CLASSES.HEALER,
    spriteKey: 'healing_totem_sprite',
    baseStats: {
        [STAT_KEYS.MAX_HP]: 150,
        [STAT_KEYS.HP]: 150,
        [STAT_KEYS.ATK]: 0,
        [STAT_KEYS.M_ATK]: 30, // 마스터 마법공격력 기반 힐량 결정
        [STAT_KEYS.DEF]: 20,
        [STAT_KEYS.M_DEF]: 20,
        [STAT_KEYS.SPEED]: 0,
        [STAT_KEYS.ATK_SPD]: 0.6, // 힐 주기를 결정하는 공속
        [STAT_KEYS.ATK_RANGE]: 450, // 힐 범위
        [STAT_KEYS.RANGE_MIN]: 0,
        [STAT_KEYS.RANGE_MAX]: 450,
        [STAT_KEYS.CAST_SPD]: 1.0,
        [STAT_KEYS.ACC]: 100,
        [STAT_KEYS.EVA]: 0,
        [STAT_KEYS.CRIT]: 0,
        [STAT_KEYS.ULT_CHARGE]: 0,
        [STAT_KEYS.RES_FIRE]: 0,
        [STAT_KEYS.RES_ICE]: 0,
        [STAT_KEYS.RES_LIGHTNING]: 20,
        [STAT_KEYS.STAMINA]: 0,
        [STAT_KEYS.STAM_REGEN]: 0
    }
};
