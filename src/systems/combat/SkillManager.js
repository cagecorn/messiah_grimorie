import Logger from '../../utils/Logger.js';
import chargeAttack from './skills/ChargeAttack.js';

/**
 * 스킬 매니저 (Skill Manager)
 * 역할: [유닛별 스킬 데이터 관리 및 쿨다운 정책 결정]
 */
class SkillManager {
    constructor() {
        this.skills = new Map();
        this.initializeDefaultSkills();
    }

    /**
     * 기본 스킬 데이터 정의
     */
    initializeDefaultSkills() {
        // 아렌 (Aren)
        this.skills.set('aren', {
            id: 'chargeattack',
            name: 'Charge Attack',
            nameKey: 'skill_charge_attack_name',
            description: 'Gathers power and dashes forward.',
            descriptionKey: 'skill_charge_attack_desc',
            cooldown: 8000, // 8 seconds
            logic: chargeAttack
        });

        // 고블린 (Goblin) - 스킬 없음
        this.skills.set('goblin', {
            hasSkill: false
        });
    }

    /**
     * 유닛 아이디에 해당하는 스킬 정보 반환
     */
    getSkillData(id) {
        // id가 aren_1, aren_2 형식이므로 prefix 추출
        const baseId = id.split('_')[0];
        const skill = this.skills.get(baseId);
        
        if (!skill) {
            return { hasSkill: false };
        }
        
        return {
            hasSkill: true,
            ...skill
        };
    }

    /**
     * 캐스팅 속도(castSpd)를 반영한 실제 쿨다운 배율 계산
     * @param {number} castSpd 시전 속도 (표준 1.0)
     */
    getCooldownMultiplier(castSpd) {
        // castSpd가 2.0이면 쿨타임이 0.5배(절반)로 감소
        return 1 / Math.max(0.1, castSpd);
    }
}

const skillManager = new SkillManager();
export default skillManager;
