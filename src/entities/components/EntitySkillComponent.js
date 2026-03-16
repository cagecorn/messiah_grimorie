import Logger from '../../utils/Logger.js';

/**
 * 엔티티 스킬 컴포넌트 (Entity Skill Component)
 * 역할: [스킬 및 궁극기 진행도, 충전 로직 전담]
 */
export default class EntitySkillComponent {
    constructor(entity, skillManager, ultimateManager) {
        this.entity = entity;
        this.logic = entity.logic;
        
        // 1. 스킬 데이터 초기화 (baseId 우선 사용)
        const targetId = this.logic.baseId || this.logic.id;
        this.skillData = skillManager.getSkillData(targetId);
        this.hasSkill = this.skillData.hasSkill !== false;
        this.skillProgress = (this.logic.type === 'mercenary' && this.hasSkill) ? 1.0 : 0;
        this.maxSkillCooldown = this.hasSkill ? this.skillData.cooldown : 0;

        // 2. 궁극기 데이터 초기화
        this.ultData = ultimateManager.getUltimateData(this.logic.id);
        this.hasUltimate = this.ultData.hasUltimate !== false;
        this.ultimateProgress = 0;

    }

    /**
     * 컴포넌트 재사용을 위한 리셋 (풀링 연동)
     */
    reset(skillManager, ultimateManager) {
        this.logic = this.entity.logic;
        
        // 데이터 다시 로드 (baseId 우선 사용)
        const targetId = this.logic.baseId || this.logic.id;
        this.skillData = skillManager.getSkillData(targetId);
        this.hasSkill = this.skillData.hasSkill !== false;
        this.skillProgress = (this.logic.type === 'mercenary' && this.hasSkill) ? 1.0 : 0;
        this.maxSkillCooldown = this.hasSkill ? this.skillData.cooldown : 0;

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
     * 특정 스킬 정보 가져오기
     */
    getSkill(skillId) {
        if (this.hasSkill && this.skillData.id === skillId) {
            return this.skillData;
        }
        return null;
    }

    /**
     * 스킬 사용 가능 여부 확인
     */
    isReady(skillId) {
        return this.hasSkill && this.skillData.id === skillId && this.skillProgress >= 1.0;
    }

    /**
     * 스킬 사용 실행
     */
    useSkill(skillId, target) {
        const skill = this.getSkill(skillId);
        if (skill && skill.logic && this.isReady(skillId)) {
            skill.logic.execute(this.entity, target);
            this.skillProgress = 0; // 게이지 리셋
            if (this.entity.hpBar) this.entity.hpBar.isDirty = true;
            return true;
        }
        return false;
    }

    /**
     * 궁극기 정보 가져오기
     */
    getUltimate() {
        return this.hasUltimate ? this.ultData : null;
    }

    /**
     * 궁극기 사용 가능 여부 확인
     */
    isUltimateReady() {
        return this.hasUltimate && this.ultimateProgress >= 1.0;
    }

    /**
     * 궁극기 사용 실행
     */
    useUltimate(target) {
        if (this.isUltimateReady() && this.ultData.logic) {
            this.ultData.logic.execute(this.entity, target);
            this.ultimateProgress = 0; // 게이지 리셋
            if (this.entity.hpBar) this.entity.hpBar.isDirty = true;
            return true;
        }
        return false;
    }

    /**
     * 궁극기 게이지 충전
     */
    gainUltimateCharge(points, applyMultiplier = true) {
        if (!this.hasUltimate || !this.logic.isAlive || this.ultimateProgress >= 1.0) return;

        // [USER 요청] 자인이 궁극기를 사용한 동안 궁극기 게이지 보충 금지
        if (this.entity.isUltActive) return;

        const multiplier = applyMultiplier ? (this.logic.stats.get('ultChargeSpeed') || 1.0) : 1.0;
        const gain = (points / 100) * multiplier;

        const oldProgress = this.ultimateProgress;
        this.ultimateProgress = Math.min(1.0, this.ultimateProgress + gain);

        if (this.entity.hpBar && Math.floor(oldProgress * 100) !== Math.floor(this.ultimateProgress * 100)) {
            this.entity.hpBar.isDirty = true;
        }
    }
}
