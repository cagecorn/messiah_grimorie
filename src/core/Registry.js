import StringUtil from '../utils/StringUtil.js';
import Logger from '../utils/Logger.js';

/**
 * 전역 레지스트리 시스템 (Global Registry System)
 * 용병, 몬스터, 아이템 등 모든 데이터를 대소문자 구분 없이 안전하게 접근하게 해주는 매니저입니다.
 */
class Registry {
    constructor(name) {
        this.name = name;
        this.data = new Map();
    }

    /**
     * 데이터 등록
     * @param {string} key 
     * @param {any} value 
     */
    register(key, value) {
        const normalizedKey = StringUtil.normalize(key);
        if (this.data.has(normalizedKey)) {
            Logger.warn("REGISTRY", `[${this.name}] Overwriting existing key: ${normalizedKey}`);
        }
        this.data.set(normalizedKey, value);
    }

    /**
     * 데이터 조회 (대소문자 무시)
     * @param {string} key 
     * @returns {any}
     */
    get(key) {
        const normalizedKey = StringUtil.normalize(key);
        return this.data.get(normalizedKey);
    }

    /**
     * 존재 여부 확인
     * @param {string} key 
     * @returns {boolean}
     */
    has(key) {
        const normalizedKey = StringUtil.normalize(key);
        return this.data.has(normalizedKey);
    }

    /**
     * 모든 데이터 반환
     */
    getAll() {
        return Object.fromEntries(this.data);
    }
}

// 시스템 전반에서 사용할 통합 레지스트리들
export const MercenaryRegistry = new Registry('Mercenaries');
export const MonsterRegistry = new Registry('Monsters');
export const ItemRegistry = new Registry('Items');
export const SkillRegistry = new Registry('Skills');

/**
 * 통합 접근 매니저 (Global Lookup)
 */
const DataRegistry = {
    mercenaries: MercenaryRegistry,
    monsters: MonsterRegistry,
    items: ItemRegistry,
    skills: SkillRegistry,

    /**
     * 가장 기초적인 매니저: 어떤 카테고리의 어떤 키든 대소문자 무시하고 가져옴
     */
    getSafe: (category, key) => {
        const registry = DataRegistry[category];
        if (!registry) {
            Logger.error("REGISTRY", `Unknown category: ${category}`);
            return null;
        }
        return registry.get(key);
    }
};

export default DataRegistry;
