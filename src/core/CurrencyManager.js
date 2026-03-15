import Logger from '../utils/Logger.js';
import state from './GlobalState.js';
import EventBus from './EventBus.js';
import indexDBManager from './IndexDBManager.js';

/**
 * 재화 매니저 (CurrencyManager)
 * 역할: [자산 통제관]
 * 
 * 설명: 골드, 다이아, 유저 경험치 등 게임 내 모든 경제적 자산을 총괄합니다.
 * 자산의 증감 시 IndexDB에 자동으로 동기화합니다.
 */
class CurrencyManager {
    constructor() {
        Logger.system("CurrencyManager: Initialized (Economy hub ready).");
    }

    /**
     * 재화 추가
     * @param {string} type 'gold', 'diamond', 'exp' 등
     * @param {number} amount 
     */
    add(type, amount) {
        if (!state.economy[type] && state.economy[type] !== 0) {
            state.economy[type] = 0;
        }

        state.economy[type] += amount;
        Logger.info("ECONOMY", `Currency added: [${type}] +${amount} (Total: ${state.economy[type]})`);
        
        this.dispatchChange(type);
    }

    /**
     * 재화 소모
     */
    spend(type, amount) {
        const current = state.economy[type] || 0;
        if (current < amount) {
            Logger.warn("ECONOMY", `Insufficient funds: [${type}] needs ${amount}, has ${current}`);
            return false;
        }

        state.economy[type] -= amount;
        Logger.info("ECONOMY", `Currency spent: [${type}] -${amount} (Remaining: ${state.economy[type]})`);
        
        this.dispatchChange(type);
        return true;
    }

    /**
     * 상태 변경 전파 및 저장
     */
    dispatchChange(type) {
        EventBus.emit(`CURRENCY_CHANGED_${type.toUpperCase()}`, { amount: state.economy[type] });
        
        // [자동 저장] 갓 오브젝트 관리 - 데이터 무결성 보장
        this.saveToDB();
    }

    async saveToDB() {
        try {
            await indexDBManager.save('messiahData', { 
                id: state.messiah.id, 
                level: state.messiah.level,
                economy: state.economy,
                gameState: state.gameState
            });
        } catch (err) {
            Logger.error("ECONOMY_SAVE", `Failed to persist currency: ${err.message}`);
        }
    }

    /**
     * DB에서 데이터 로드하여 GlobalState 복구
     */
    async loadFromDB() {
        try {
            const data = await indexDBManager.load('messiahData', state.messiah.id);
            if (data) {
                // [GOD OBJECT] 불러온 데이터를 전역 상태에 병합
                state.messiah.level = data.level || state.messiah.level;
                
                if (data.economy) {
                    Object.assign(state.economy, data.economy);
                }
                
                if (data.gameState) {
                    // dungeonRecords 등 깊은 객체 보존을 위해 병합
                    if (!state.gameState) state.gameState = {};
                    Object.assign(state.gameState, data.gameState);
                }

                Logger.info("ECONOMY_LOAD", "Persistent data restored successfully.");
                return true;
            }
        } catch (err) {
            Logger.error("ECONOMY_LOAD", `Failed to load persistence: ${err.message}`);
        }
        return false;
    }

    /**
     * 잔액 확인
     */
    getBalance(type) {
        return state.economy[type] || 0;
    }
}

const currencyManager = new CurrencyManager();
export default currencyManager;
