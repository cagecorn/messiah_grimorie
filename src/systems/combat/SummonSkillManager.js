import Logger from '../../utils/Logger.js';

/**
 * 소환 기술 매니저 (Summon Skill Manager)
 * 역할: [소환 시점 마스터의 스탯을 스냅샷하여 소환물 스케일링]
 */
class SummonSkillManager {
    static scaleSummon(master, summonConfig) {
        // 소환 시점 마스터의 실시간 최종 스탯 참조 (Standardized Getters 활용)
        const masterAtk = master.getTotalAtk();
        const masterMAtk = master.getTotalMAtk();
        const masterMaxHp = master.getTotalMaxHp();

        // 설정된 비율(ratio)에 따라 소환물 기본 스탯 결정
        const scaledStats = {
            maxHp: masterMaxHp * (summonConfig.hpRatio || 0.5),
            atk: masterAtk * (summonConfig.atkRatio || 0.5),
            mAtk: masterMAtk * (summonConfig.mAtkRatio || 0.5),
            // 기타 공통 스탯 상속
            speed: master.getTotalSpeed(),
            atkRange: summonConfig.atkRange || 50
        };

        Logger.info("COMBAT", `Scaled summon [${summonConfig.name}] based on ${master.name}'s power.`);
        return scaledStats;
    }
}

export default SummonSkillManager;
