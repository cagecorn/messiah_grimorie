import Logger from '../utils/Logger.js';
import indexDBManager from '../core/IndexDBManager.js';
import mercenaryCollectionManager from './MercenaryCollectionManager.js';

/**
 * 개발자 명령어 매니저 (Dev Command Manager)
 * 역할: [콘솔을 통한 디버깅 및 치트 명령어 제공]
 */
class DevCommandManager {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * 전역 객체(window.dev)로 등록
     */
    init() {
        if (this.isInitialized) return;
        
        window.dev = this;
        this.isInitialized = true;
        
        Logger.system("DevCommandManager: Global 'dev' command initialized. (Type 'dev' in console to see commands)");
        
        // 사용 가능한 명령어 출력
        this.help();
    }

    /**
     * 도움말 출력
     */
    help() {
        console.group("%c🛠️ Messiah Grimoire Dev Commands", "color: #00ff00; font-weight: bold; font-size: 14px;");
        console.log("%cdev.addMercenary(id, count)%c - 특정 용병 추가", "font-weight: bold;", "font-weight: normal;");
        console.log("%cdev.addZayn()%c - 자인 즉시 지급 (자인 한 마리 지급)", "font-weight: bold;", "font-weight: normal;");
        console.log("%cdev.clearData()%c - 모든 로컬 데이터 및 DB 초기화 (새로고침 필요)", "font-weight: bold;", "font-weight: normal;");
        console.log("%cdev.help()%c - 이 도움말 다시 보기", "font-weight: bold;", "font-weight: normal;");
        console.groupEnd();
    }

    /**
     * 용병 추가
     * @param {string} id 용병 ID (aren, zayn 등)
     * @param {number} count 수량
     */
    async addMercenary(id, count = 1) {
        try {
            await mercenaryCollectionManager.addMercenary(id, count);
            Logger.info("DEV_CMD", `Added ${count} mercenary: ${id}`);
            console.log(`%c✅ Successfully added ${count} ${id}(s).`, "color: #00ff00;");
        } catch (err) {
            Logger.error("DEV_CMD", `Failed to add mercenary: ${err.message}`);
        }
    }

    /**
     * 자인 즉시 지급 단축키
     */
    addZayn() {
        this.addMercenary('zayn', 1);
    }

    /**
     * 데이터 전체 초기화
     */
    async clearData() {
        if (!confirm("⚠️ 정말로 모든 게임 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            return;
        }

        try {
            // IndexedDB 삭제 시도 (DB 이름은 IndexDBManager에 정의된 값 활용)
            const dbName = 'messiah_database';
            const request = indexedDB.deleteDatabase(dbName);
            
            request.onsuccess = () => {
                Logger.system("DEV_CMD: IndexedDB deleted successfully.");
                localStorage.clear();
                alert("데이터가 완전히 초기화되었습니다. 페이지를 새로고침합니다.");
                window.location.reload();
            };
            
            request.onerror = () => {
                Logger.error("DEV_CMD", "Failed to delete IndexedDB.");
            };
            
            request.onblocked = () => {
                Logger.warning("DEV_CMD", "Delete blocked. Please close other tabs of this game.");
                alert("다른 탭에서 게임이 실행 중입니다. 모든 탭을 닫고 다시 시도해 주세요.");
            };
        } catch (err) {
            Logger.error("DEV_CMD", `Error clearing data: ${err.message}`);
        }
    }
}

const devCommandManager = new DevCommandManager();
export default devCommandManager;
