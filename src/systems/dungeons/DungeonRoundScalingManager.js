import Logger from '../../utils/Logger.js';

/**
 * 던전 라운드 스케일링 매니저 (Dungeon Round Scaling Manager)
 * 역할: [라운드 상승에 따른 몬스터 레벨 및 스탯 배율 계산]
 */
class DungeonRoundScalingManager {
    constructor() {
        // [규칙]: 3라운드당 몬스터 레벨 1 증가
        this.roundsPerLevel = 3;
    }

    /**
     * 현재 라운드에 적합한 몬스터 레벨 계산
     * @param {number} round 현재 라운드
     * @returns {number} 계산된 몬스터 레벨
     */
    getMonsterLevel(round) {
        // 공식: 1 + Math.floor((round - 1) / 3)
        // 1~3R: Lv.1, 4~6R: Lv.2, 7~9R: Lv.3 ...
        const level = 1 + Math.floor((round - 1) / this.roundsPerLevel);
        return Math.max(1, level);
    }

    /**
     * 추가적인 스탯 배율이 필요한 경우 사용 (성급 배율과 별개)
     * 현재는 레벨업 시스템(ClassGrowth)이 주력이므로 1.0 반환
     */
    getExtraMultiplier(round) {
        return 1.0;
    }
}

const dungeonRoundScalingManager = new DungeonRoundScalingManager();
export default dungeonRoundScalingManager;
