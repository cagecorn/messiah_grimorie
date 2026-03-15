import Logger from '../utils/Logger.js';

/**
 * 풀링 매니저 (Pooling Manager)
 * 역할: [라우터 (Router) & 자원 최적화기]
 * 
 * 설명: 1000마리 이상의 유닛과 수많은 이펙트가 발생하는 게임 환경에서 
 * 메모리 파편화와 가비지 컬렉션(GC) 부하를 막기 위해 객체를 재사용(Pooling)하는 라우터입니다.
 */
class Pool {
    constructor(typeName, factory, initialSize = 0) {
        this.typeName = typeName;
        this.factory = factory;
        this.freeObjects = [];
        
        for (let i = 0; i < initialSize; i++) {
            this.freeObjects.push(this.factory());
        }
    }

    /**
     * 객체 획득
     */
    get() {
        if (this.freeObjects.length > 0) {
            const obj = this.freeObjects.pop();
            if (obj.onAcquire) obj.onAcquire();
            return obj;
        }
        return this.factory();
    }

    /**
     * 객체 반납
     */
    release(obj) {
        if (obj.onRelease) obj.onRelease();
        this.freeObjects.push(obj);
    }
}

class PoolingManager {
    constructor() {
        this.pools = new Map();
        Logger.system("PoolingManager Router: Initialized (GC pressure defense ready).");
    }

    /**
     * 특정 타입의 풀 등록
     * @param {string} type 'monster', 'fx', 'projectile' 등
     * @param {function} factory 객체 생성 함수
     * @param {number} size 초기 풀 사이즈
     * @param {boolean} overwrite 기존 풀이 있을 경우 덮어쓸지 여부
     */
    registerPool(type, factory, size = 0, overwrite = false) {
        const key = type.toLowerCase();
        if (this.pools.has(key) && !overwrite) {
            Logger.info("POOL_ROUTER", `Pool already exists: ${type}. Use overwrite=true if factory change is needed.`);
            return;
        }
        
        const pool = new Pool(type, factory, size);
        this.pools.set(key, pool);
        Logger.info("POOL_ROUTER", `Pool registered: ${type} (Initial size: ${size}, Overwrite: ${overwrite})`);
    }

    /**
     * 객체 획득 요청 라우팅
     */
    get(type) {
        const pool = this.pools.get(type.toLowerCase());
        if (!pool) {
            Logger.warn("POOL_ROUTER", `No pool found for type: ${type}`);
            return null;
        }
        return pool.get();
    }

    /**
     * 객체 반납 요청 라우팅
     */
    release(type, obj) {
        const pool = this.pools.get(type.toLowerCase());
        if (pool) {
            pool.release(obj);
        } else {
            Logger.warn("POOL_ROUTER", `Trying to release object to unknown pool: ${type}`);
        }
    }

    /**
     * 전체 풀 상태 로깅 (디버그용)
     */
    logStatus() {
        this.pools.forEach((pool, type) => {
            Logger.info("POOL_STATUS", `${type}: ${pool.freeObjects.length} objects available.`);
        });
    }
}

const poolingManager = new PoolingManager();
export default poolingManager;
