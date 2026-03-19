import { ShadowmancerData } from '../data/classes/Shadowmancer.js';
import { STAT_KEYS, ENTITY_CLASSES } from './StatSchema.js';

/**
 * 엔티티 상수 (Entity Constants)
 * 역할: 전역 엔티티 시스템에서 사용되는 스탯 키 및 클래스 정의
 */
export { STAT_KEYS, ENTITY_CLASSES };

/**
 * 클래스별 성장 가중치 (Class Growth Weights)
 * 레벨업 시 해당 스탯이 얼마나 상승하는지에 대한 배율
 */
export const CLASS_GROWTH = {
    [ENTITY_CLASSES.WARRIOR]: {
        [STAT_KEYS.ATK]: 2.0,
        [STAT_KEYS.DEF]: 1.5,
        [STAT_KEYS.MAX_HP]: 3.0,
        [STAT_KEYS.M_ATK]: 0.5,
        [STAT_KEYS.M_DEF]: 0.8,
        [STAT_KEYS.STAMINA]: 2.0, // 고함량
        [STAT_KEYS.STAM_REGEN]: 0.1 // 보통
    },
    [ENTITY_CLASSES.SWORDMASTER]: {
        [STAT_KEYS.ATK]: 2.3, // 로그와 전사 사이
        [STAT_KEYS.DEF]: 1.2,
        [STAT_KEYS.MAX_HP]: 2.2,
        [STAT_KEYS.M_ATK]: 0.5,
        [STAT_KEYS.M_DEF]: 1.0,
        [STAT_KEYS.STAMINA]: 2.5, // 패링을 위해 스태미나 대량 보유
        [STAT_KEYS.STAM_REGEN]: 0.3 // 빠른 회복
    },
    [ENTITY_CLASSES.ARCHER]: {
        [STAT_KEYS.ATK]: 1.8,
        [STAT_KEYS.ATK_SPD]: 0.02, // [FIX] 1.5 -> 0.02 (초당 공격 횟수가 과도하게 증가하는 현상 수정)
        [STAT_KEYS.ACC]: 1.2,
        [STAT_KEYS.EVA]: 1.2,
        [STAT_KEYS.MAX_HP]: 1.5,
        [STAT_KEYS.STAMINA]: 1.2,
        [STAT_KEYS.STAM_REGEN]: 0.3 // 빠름
    },
    [ENTITY_CLASSES.HEALER]: {
        [STAT_KEYS.M_ATK]: 2.0,
        [STAT_KEYS.M_DEF]: 1.5,
        [STAT_KEYS.MAX_HP]: 1.8,
        [STAT_KEYS.DEF]: 1.0,
        [STAT_KEYS.STAMINA]: 1.0,
        [STAT_KEYS.STAM_REGEN]: 0.15
    },
    [ENTITY_CLASSES.WIZARD]: {
        [STAT_KEYS.M_ATK]: 2.5,
        [STAT_KEYS.M_DEF]: 1.2,
        [STAT_KEYS.ACC]: 1.5,
        [STAT_KEYS.MAX_HP]: 1.2,
        [STAT_KEYS.STAMINA]: 0.8,
        [STAT_KEYS.STAM_REGEN]: 0.4 // 매우빠름 (스펠캐스터)
    },
    [ENTITY_CLASSES.BARD]: {
        [STAT_KEYS.MAX_HP]: 1.5,
        [STAT_KEYS.ATK]: 1.2,
        [STAT_KEYS.M_ATK]: 1.2,
        [STAT_KEYS.DEF]: 1.2,
        [STAT_KEYS.M_DEF]: 1.2,
        [STAT_KEYS.SPEED]: 1.1,
        [STAT_KEYS.STAMINA]: 1.2,
        [STAT_KEYS.STAM_REGEN]: 0.2
    },
    [ENTITY_CLASSES.ROGUE]: {
        [STAT_KEYS.ATK]: 2.5,
        [STAT_KEYS.ATK_SPD]: 0.03,
        [STAT_KEYS.SPEED]: 1.3,
        [STAT_KEYS.CRIT]: 0.01,
        [STAT_KEYS.MAX_HP]: 1.5,
        [STAT_KEYS.DEF]: 0.8,
        [STAT_KEYS.M_DEF]: 1.0,
        [STAT_KEYS.STAMINA]: 1.5,
        [STAT_KEYS.STAM_REGEN]: 0.2
    },
    [ENTITY_CLASSES.TOTEMIST]: {
        [STAT_KEYS.M_ATK]: 2.5,    // 위자드급 화력
        [STAT_KEYS.ATK]: 0.5,      // 보조 물리 공격력
        [STAT_KEYS.MAX_HP]: 2.0,   // 위자드(1.2)보다 훨씬 튼튼함
        [STAT_KEYS.DEF]: 1.5,      // 전사급 방어력 (설치 시 안정성)
        [STAT_KEYS.M_DEF]: 1.2,
        [STAT_KEYS.SPEED]: 0.2,    // 성장 속도 매우 낮춤 (기동성 페널티)
        [STAT_KEYS.ACC]: 1.0,
        [STAT_KEYS.STAMINA]: 1.5,
        [STAT_KEYS.STAM_REGEN]: 0.5 // 토템 설치를 위한 빠른 기력 회복
    },
    [ENTITY_CLASSES.FLYINGMAN]: {
        [STAT_KEYS.ATK]: 1.5,
        [STAT_KEYS.M_ATK]: 2.0,
        [STAT_KEYS.SPEED]: 0.5,    // [FIX] 110 -> 0.5 (폭주 방지)
        [STAT_KEYS.MAX_HP]: 1.6,
        [STAT_KEYS.DEF]: 1.0,
        [STAT_KEYS.M_DEF]: 1.2,
        [STAT_KEYS.ACC]: 1.2,
        [STAT_KEYS.EVA]: 1.5,      // 기동력/공중 회피 강조
        [STAT_KEYS.CRIT]: 0.01,
        [STAT_KEYS.STAM_REGEN]: 0.2
    },
    [ENTITY_CLASSES.SHADOWMANCER]: ShadowmancerData.growth,
    [ENTITY_CLASSES.HOLYKNIGHT]: {
        [STAT_KEYS.M_ATK]: 2.0,
        [STAT_KEYS.M_DEF]: 2.0,
        [STAT_KEYS.MAX_HP]: 2.5,
        [STAT_KEYS.ATK]: 1.2,
        [STAT_KEYS.DEF]: 1.2,
        [STAT_KEYS.STAMINA]: 2.0,
        [STAT_KEYS.STAM_REGEN]: 0.2
    }
};

/**
 * 전역 공통 성장 수치 (Global Base Growth)
 * 모든 클래스가 레벨업 시 기본적으로 얻는 최소 스탯 상승분
 */
export const GLOBAL_BASE_GROWTH = {
    [STAT_KEYS.MAX_HP]: 1.0,
    [STAT_KEYS.DEF]: 0.5,
    [STAT_KEYS.M_DEF]: 0.5
};

/**
 * 특이 케이스: 분(Boon)과 같은 성전사 컨셉 전사
 */
export const SPECIAL_GROWTH = {
    PALADIN_TYPE: {
        [STAT_KEYS.M_ATK]: 2.0,
        [STAT_KEYS.M_DEF]: 2.0,
        [STAT_KEYS.ATK]: 1.2,
        [STAT_KEYS.DEF]: 1.2,
        [STAT_KEYS.MAX_HP]: 2.5
    }
};
