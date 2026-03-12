import Logger from '../utils/Logger.js';

/**
 * 엔티티 매니저 (Entity Manager)
 * 역할: [라우터 (Router) & 엔티티 수명주기 관리자]
 * 
 * 설명: 월드에 존재하는 모든 동적 객체(용병, 몬스터, NPC)를 총괄하는 라우터입니다.
 * 등록, 해제, 특정 조건의 유닛 검색 요청을 하위 필터링 로직으로 배분합니다.
 */
class EntityManager {
    constructor() {
        this.entities = new Set();
        this.categories = {
            mercenary: new Set(),
            monster: new Set(),
            npc: new Set()
        };
        
        Logger.system("EntityManager Router: Initialized (Dynamic entity hub ready).");
    }

    /**
     * 엔티티 등록
     */
    register(entity, category = 'monster') {
        this.entities.add(entity);
        if (this.categories[category]) {
            this.categories[category].add(entity);
        }
        Logger.info("ENTITY_ROUTER", `Entity registered: [${category}] ${entity.id || 'Unknown'}`);
    }

    /**
     * 엔티티 해제
     */
    unregister(entity, category = 'monster') {
        this.entities.delete(entity);
        if (this.categories[category]) {
            this.categories[category].delete(entity);
        }
    }

    /**
     * 특정 카테고리의 모든 엔티티 반환
     */
    getCategory(category) {
        return this.categories[category] || new Set();
    }

    /**
     * 조건부 엔티티 검색 라우팅
     */
    find(predicate) {
        return Array.from(this.entities).filter(predicate);
    }

    /**
     * 모든 엔티티 일괄 업데이트 라우팅
     */
    updateAll(delta) {
        this.entities.forEach(entity => {
            if (entity.update) entity.update(delta);
        });
    }
}

const entityManager = new EntityManager();
export default entityManager;
