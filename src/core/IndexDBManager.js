import Logger from '../utils/Logger.js';

/**
 * 인덱스DB 매니저 (IndexDB Manager)
 * 역할: [라우터 (Router)]
 * 
 * 설명: 브라우저의 IndexedDB에 데이터를 저장하고 로드하는 과정을 총괄하는 라우터입니다.
 * 'UserStore', 'GameStore', 'LogStore' 등 수많은 하위 스토어들에 대한 접근 요청을 분류하여 전달합니다.
 */
class IndexDBManager {
    constructor() {
        this.dbName = 'MessiahGrimoireDB';
        this.version = 1;
        this.db = null;
        
        Logger.system("IndexDBManager Router: Initialized.");
    }

    /**
     * 데이터베이스 초기화 및 라우팅 준비
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // 하위 스토어(Sub-stores) 라우팅을 위한 공간 생성
                if (!db.objectStoreNames.contains('userData')) db.createObjectStore('userData', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('gameStats')) db.createObjectStore('gameStats', { keyPath: 'id' });
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                Logger.info("DB_ROUTER", "Connected to IndexedDB.");
                resolve(this.db);
            };

            request.onerror = (event) => {
                Logger.error("DB_ROUTER", "Database connection failed.");
                reject(event.target.error);
            };
        });
    }

    /**
     * 특정 스토어로 저장 요청을 라우팅합니다.
     */
    async save(storeName, data) {
        if (!this.db) await this.init();
        // 실제 저장 로직은 각 하위 스토어 비즈니스 로직에 따라 분배(Routing) 예정
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.put(data);
        Logger.info("DB_ROUTER", `Data saved to ${storeName}`);
    }

    /**
     * 특정 스토어에서 데이터 로드 요청을 라우팅합니다.
     */
    async load(storeName, key) {
        if (!this.db) await this.init();
        return new Promise((resolve) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
        });
    }
}

const indexDBManager = new IndexDBManager();
export default indexDBManager;
