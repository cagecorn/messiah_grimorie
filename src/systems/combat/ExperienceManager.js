import Logger from '../../utils/Logger.js';
import EventBus, { EVENTS } from '../../core/EventBus.js';
import state from '../../core/GlobalState.js';
import currencyManager from '../../core/CurrencyManager.js';
import rewardScalingManager from './RewardScalingManager.js';
import mercenaryCollectionManager from '../MercenaryCollectionManager.js';

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
        if (this.isInitialized) {
            Logger.system("ExperienceManager: Already watching battle rewards.");
            return;
        }
        
        // 사망 이벤트 구독 (Global Singleton 이므로 한 번만 등록)
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

        Logger.info("EXP_DEBUG", `Entity Died: ${entity.logic.name}. Base: ${baseExp}, Level: ${monsterLevel}, Final: ${finalExp}`);

        // [USER 요청] 유저 객체는 존재하지 않으므로, 오직 용병들에게만 경험치를 분배합니다.
        this.distributeExpToMercenaries(finalExp);
    }

    /**
     * 현재 전투 중인 모든 아군 용병에게 경험치 지급
     */
    distributeExpToMercenaries(amount) {
        const scene = this.getActiveBattleScene();
        if (!scene) {
            Logger.warn("EXP_DEBUG", "Failed to find active BattleScene. Check window.game assignment.");
            return;
        }
        if (!scene.allies) {
            Logger.warn("EXP_DEBUG", "BattleScene found but allies list is missing.");
            return;
        }

        // 1. 경험치를 받을 자격이 있는 용병 필터링 (살아있고, 소환수가 아닌 경우)
        const eligibleAllies = scene.allies.filter(ally => 
            ally.logic && ally.logic.isAlive && ally.logic.type !== 'summon'
        );

        if (eligibleAllies.length === 0) {
            Logger.warn("EXP_DEBUG", "No eligible allies found to receive EXP.");
            return;
        }

        // 2. [USER 요청] 경험치 쉐어: 전체 경험치를 적격 용병 수로 나눕니다.
        const sharedExp = amount / eligibleAllies.length;
        
        Logger.info("EXP_DEBUG", `Distributing total ${amount.toFixed(1)} EXP among ${eligibleAllies.length} allies (${sharedExp.toFixed(1)} each).`);

        eligibleAllies.forEach(ally => {
            Logger.info("EXP_DEBUG", `Giving ${sharedExp.toFixed(1)} EXP to ${ally.logic.name}`);
            
            // 각 용병의 LevelingManager가 내부적으로 스탯 성장을 처리합니다
            ally.logic.leveling.gainExp(sharedExp);

            // [SAVE] 컬렉션 매니저를 통해 DB에 영구 저장 (baseId 활용)
            const lev = ally.logic.leveling;
            mercenaryCollectionManager.updateMercenaryProgress(
                ally.logic.baseId, 
                lev.getLevel(), 
                lev.exp
            );
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
