import Logger from '../../utils/Logger.js';
import EventBus, { EVENTS } from '../../core/EventBus.js';
import state from '../../core/GlobalState.js';
import currencyManager from '../../core/CurrencyManager.js';
import rewardScalingManager from './RewardScalingManager.js';

/**
 * 경험치 드랍 매니저 (Experience Manager)
 * 역할: [유저 성장의 엔진]
 * 
 * 설명: 몬스터 사망 이벤트를 수신하여 유저 경험치를 정산합니다.
 */
class ExperienceManager {
    constructor() {
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        // 사망 이벤트 구독
        EventBus.on(EVENTS.ENTITY_DIED, (entity) => this.handleEntityDeath(entity));
        
        this.isInitialized = true;
        Logger.system("ExperienceManager: Listening for battle rewards...");
    }

    /**
     * 사망한 엔티티 분석 및 경험치 정산
     */
    handleEntityDeath(entity) {
        if (entity.team === 'mercenary' || entity.team === 'summon') return;

        const baseExp = entity.logic.baseRewardExp || 10;
        const monsterLevel = entity.logic.leveling.getLevel();
        
        // [SCALING 연동] 레벨에 따른 동적 경험치 산출
        const finalExp = rewardScalingManager.calculateScaledExp(baseExp, monsterLevel);

        // [USER 요청] 유저 객체는 존재하지 않으므로, 오직 용병들에게만 경험치를 분배합니다.
        this.distributeExpToMercenaries(finalExp);
    }

    /**
     * 현재 전투 중인 모든 아군 용병에게 경험치 지급
     */
    distributeExpToMercenaries(amount) {
        const scene = this.getActiveBattleScene();
        if (!scene || !scene.allies) return;

        scene.allies.forEach(ally => {
            if (ally.logic && ally.logic.isAlive) {
                // 각 용병의 LevelingManager가 내부적으로 스탯 성장을 처리합니다 (BaseEntity 연동)
                ally.logic.leveling.gainExp(amount);
            }
        });
    }

    getActiveBattleScene() {
        if (window.game && window.game.scene) {
            return window.game.scene.getScene('BattleScene');
        }
        return null;
    }
}

const experienceManager = new ExperienceManager();
export default experienceManager;
