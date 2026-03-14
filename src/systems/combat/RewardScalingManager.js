import Logger from '../../utils/Logger.js';

/**
 * 프로젝트: 메시아 그리모어
 * 보상 스케일링 매니저 (Reward Scaling Manager)
 * 역할: [황금과 성장의 균형추]
 * 
 * 설명: 몬스터의 레벨과 던전 라운드에 따라 경험치, 골드, 드랍률 등의 상승폭을 결정합니다.
 * 하드코딩을 배제하고 지수/선형 성장을 지원합니다.
 */
class RewardScalingManager {
    constructor() {
        // [밸런스 파라미터]
        this.expGrowthRate = 0.12;  // 레벨당 경험치 12% 상승
        this.goldGrowthRate = 0.15; // 레벨당 골드 15% 상승
        this.lootChanceRate = 0.05; // 레벨당 유니크 아이템 드랍률 5% 보정
    }

    /**
     * 레벨에 따른 경험치 배율 계산
     */
    getExpMultiplier(level) {
        // 공식: (1 + growthRate)^(level - 1)
        return Math.pow(1 + this.expGrowthRate, level - 1);
    }

    /**
     * 레벨에 따른 골드 배율 계산
     */
    getGoldMultiplier(level) {
        return Math.pow(1 + this.goldGrowthRate, level - 1);
    }

    /**
     * 보정된 경험치 산출
     */
    calculateScaledExp(baseExp, level) {
        const multiplier = this.getExpMultiplier(level);
        return Math.floor(baseExp * multiplier);
    }

    /**
     * 보정된 골드 범위 또는 단일값 산출
     */
    calculateScaledGold(baseMin, baseMax, level) {
        const multiplier = this.getGoldMultiplier(level);
        return {
            min: Math.floor(baseMin * multiplier),
            max: Math.floor(baseMax * multiplier)
        };
    }
}

const rewardScalingManager = new RewardScalingManager();
export default rewardScalingManager;
