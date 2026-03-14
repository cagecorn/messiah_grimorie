import EventBus, { EVENTS } from '../core/EventBus.js';
import Logger from '../utils/Logger.js';

/**
 * 통계 매니저 (Statistics Manager)
 * 역할: [메인 스레드와 통계 워커 사이의 가교 역할]
 */
class StatisticsManager {
    constructor() {
        this.worker = null;
        this.unitCache = new Map(); // 최신 수신 데이터 캐시
        this.initWorker();
        this.setupEventListeners();
    }

    initWorker() {
        try {
            // public 폴더의 워커 파일을 참조
            // Vite 환경에서는 /로 시작하면 public 폴더에서 가져옵니다.
            this.worker = new Worker('/stat_tracker_worker.js');
            
            this.worker.onmessage = (e) => {
                const { type, data } = e.data;
                if (type === 'UNIT_STATS_RES') {
                    this.unitCache.set(data.id, data);
                    // 데이터가 필요한 쪽으로 다시 방송하거나 콜백 실행 가능
                    EventBus.emit('STATS_UPDATED', data);
                }
            };

            this.worker.onerror = (err) => {
                Logger.error("STATS", "Worker error:", err);
            };

            Logger.system("Statistics Worker Initialized via Hybrid Architecture.");
        } catch (error) {
            Logger.error("STATS", "Failed to initialize worker:", error);
        }
    }

    setupEventListeners() {
        // 전투 이벤트 수신 및 워커로 전달
        EventBus.on(EVENTS.COMBAT_DATA, (data) => {
            if (this.worker) {
                this.worker.postMessage({ type: 'COMBAT_EVENT', data });
            }
        });

        // 장면 전환 시 초기화 (필요한 경우)
        EventBus.on(EVENTS.SCENE_CHANGED, () => {
             // 전투 씬이 끝날 때 초기화 할 것인지 선택 가능
        });
    }

    /**
     * 특정 유닛의 현재 통계 요청
     */
    requestUnitStats(id) {
        if (this.worker) {
            this.worker.postMessage({ type: 'GET_UNIT_STATS', data: { id } });
        }
    }

    /**
     * 캐시된 데이터 가져오기 (즉시 반환용)
     */
    getCachedStats(id) {
        return this.unitCache.get(id);
    }
    
    reset() {
        if (this.worker) {
            this.worker.postMessage({ type: 'RESET_STATS' });
            this.unitCache.clear();
        }
    }
}

const statisticsManager = new StatisticsManager();
export default statisticsManager;
