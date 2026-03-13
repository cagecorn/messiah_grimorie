import Logger from '../../utils/Logger.js';

/**
 * 엔티티 스킬 컴포넌트 (Entity Skill Component)
 * 역할: [스킬 및 궁극기 진행도, 충전 로직 전담]
 */
export default class EntitySkillComponent {
    constructor(entity, skillManager, ultimateManager) {
        this.entity = entity;
        this.logic = entity.logic;
        
        // 1. 스킬 데이터 초기화
        this.skillData = skillManager.getSkillData(this.logic.id);
        this.hasSkill = this.skillData.hasSkill !== false;
        this.skillProgress = (this.logic.type === 'mercenary' && this.hasSkill) ? 1.0 : 0;
        this.maxSkillCooldown = this.hasSkill ? this.skillData.cooldown : 0;

        // 2. 궁극기 데이터 초기화
        this.ultData = ultimateManager.getUltimateData(this.logic.id);
        this.hasUltimate = this.ultData.hasUltimate !== false;
        this.ultimateProgress = 0;

    }

    /**
     * 프레임 업데이트
     */
    update(delta) {
        if (!this.logic.isAlive) return;

        // 스킬 충전
        if (this.hasSkill) {
            const castSpd = this.logic.stats.get('castSpd') || 1.0;
            const progressGain = delta / Math.max(1, this.maxSkillCooldown);
            
            const oldProgress = this.skillProgress;
            this.skillProgress = Math.min(1.0, this.skillProgress + progressGain * castSpd);

            if (this.entity.hpBar && Math.floor(oldProgress * 100) !== Math.floor(this.skillProgress * 100)) {
                this.entity.hpBar.isDirty = true;
            }
        }

        // 궁극기 자동 충전
        if (this.hasUltimate) {
            const ultChargeSpeed = this.logic.stats.get('ultChargeSpeed') || 1.0;
            const ultBaseTime = 40000; 
            const ultGain = delta / ultBaseTime;
            
            this.gainUltimateCharge(ultGain * 100, false);
        }
    }

    /**
     * 궁극기 게이지 충전
     */
    gainUltimateCharge(points, applyMultiplier = true) {
        if (!this.hasUltimate || !this.logic.isAlive || this.ultimateProgress >= 1.0) return;

        const multiplier = applyMultiplier ? (this.logic.stats.get('ultChargeSpeed') || 1.0) : 1.0;
        const gain = (points / 100) * multiplier;

        const oldProgress = this.ultimateProgress;
        this.ultimateProgress = Math.min(1.0, this.ultimateProgress + gain);

        if (this.entity.hpBar && Math.floor(oldProgress * 100) !== Math.floor(this.ultimateProgress * 100)) {
            this.entity.hpBar.isDirty = true;
        }
    }
}
