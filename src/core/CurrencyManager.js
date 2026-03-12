import Logger from '../utils/Logger.js';
import state from './GlobalState.js';
import EventBus from './EventBus.js';

/**
 * 재화 매니저 (CurrencyManager)
 * 역할: [자산 통제관]
 * 
 * 설명: 골드, 메시아 EXP 등 게임 내 모든 경제적 자산을 총괄합니다.
 * 자산의 증감, 잔액 확인, 경제 관련 한계치 체크 등을 담당합니다.
 */
class CurrencyManager {
    constructor() {
        Logger.system("CurrencyManager: Initialized (Economy hub ready).");
    }

    /**
     * 재화 추가
     * @param {string} type 'gold', 'messiahExp' 등
     * @param {number} amount 
     */
    add(type, amount) {
        if (!state.economy[type] && state.economy[type] !== 0) {
            state.economy[type] = 0;
        }

        state.economy[type] += amount;
        Logger.info("ECONOMY", `Currency added: [${type}] +${amount} (Total: ${state.economy[type]})`);
        
        EventBus.emit(`CURRENCY_CHANGED_${type.toUpperCase()}`, { amount: state.economy[type] });
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
        
        EventBus.emit(`CURRENCY_CHANGED_${type.toUpperCase()}`, { amount: state.economy[type] });
        return true;
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
