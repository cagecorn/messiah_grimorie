import { STAT_KEYS, ENTITY_CLASSES } from '../../core/StatSchema.js';

/**
 * 클래스: 쉐도우맨서 (Shadowmancer)
 * 설명: 로그의 변형판. 그림자를 이용해 여러가지 수행을 하는 어둠의 클래스.
 */
export const ShadowmancerData = {
    className: 'shadowmancer',
    baseClass: 'rogue',
    
    // 성장 가중치 (Growth Weights)
    growth: {
        [STAT_KEYS.ATK]: 1.8,
        [STAT_KEYS.M_ATK]: 2.2,
        [STAT_KEYS.ATK_SPD]: 0.025,
        [STAT_KEYS.SPEED]: 1.3,
        [STAT_KEYS.CRIT]: 0.015,
        [STAT_KEYS.MAX_HP]: 1.6,
        [STAT_KEYS.DEF]: 0.9,
        [STAT_KEYS.M_DEF]: 1.4,
        [STAT_KEYS.STAMINA]: 1.5,
        [STAT_KEYS.STAM_REGEN]: 0.3
    },

    // 특화 능력치 (Scaling Traits)
    traits: [
        STAT_KEYS.ATK,
        STAT_KEYS.M_ATK,
        STAT_KEYS.ATK_SPD,
        STAT_KEYS.SPEED,
        STAT_KEYS.CRIT
    ]
};
