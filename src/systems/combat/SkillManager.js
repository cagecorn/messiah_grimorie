import Logger from '../../utils/Logger.js';
import chargeAttack from './skills/ChargeAttack.js';
import knockbackShot from './skills/KnockbackShot.js';
import massHeal from './skills/MassHeal.js';
import fireball from './skills/Fireball.js';
import songOfProtection from './skills/SongOfProtection.js';
import aquaBurst from './skills/AquaBurst.js';
import fireBurst from './skills/FireBurst.js';
import sleepingBubble from './skills/SleepingBubble.js';
import stoneSkin from './skills/StoneSkin.js';
import stealth from './skills/Stealth.js';
import windBlade from './skills/WindBlade.js';
import fireTotem from './skills/FireTotem.js';
import healingTotem from './skills/HealingTotem.js';
import tornadoShot from './skills/TornadoShot.js';
import sinkingShadow from './skills/SinkingShadow.js'; // [NEW]

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

        // 엘라 (Ella) - 아처
        this.skills.set('ella', {
            id: 'knockback_shot',
            name: 'Knockback Shot',
            nameKey: 'skill_knockback_shot_name',
            description: 'Fires a powerful arrow that knocks back enemies.',
            descriptionKey: 'skill_knockback_shot_desc',
            cooldown: 8000, // 8 seconds
            logic: knockbackShot
        });

        // 세라 (Sera) - 힐러
        this.skills.set('sera', {
            id: 'massheal',
            name: 'Mass Heal',
            nameKey: 'skill_mass_heal_name',
            description: 'Heals all allies by 1.5x MAtk.',
            descriptionKey: 'skill_mass_heal_desc',
            cooldown: 12000, // 12 seconds
            logic: massHeal
        });

        // 멀린 (Merlin) - 위자드
        this.skills.set('merlin', {
            id: 'fireball',
            name: 'Fireball',
            nameKey: 'skill_fireball_name',
            description: 'Drops a massive meteor on target area.',
            descriptionKey: 'skill_fireball_desc',
            cooldown: 8000, 
            logic: fireball
        });

        // 루트 (Lute) - 바드
        this.skills.set('lute', {
            id: 'songofprotection',
            name: 'Song of Protection',
            nameKey: 'skill_song_of_protection_name',
            description: 'Creates a shield for all allies.',
            descriptionKey: 'skill_song_of_protection_desc',
            cooldown: 15000, // 15 seconds
            logic: songOfProtection
        });
 
        // 세이렌 (Siren) - 소환수 전용
        this.skills.set('siren', {
            id: 'aquaburst',
            name: 'Aqua Burst',
            nameKey: 'skill_aqua_burst_name',
            description: 'Fires a water bubble that explodes on impact.',
            descriptionKey: 'skill_aqua_burst_desc',
            cooldown: 5000, // 5 seconds
            logic: aquaBurst
        });
 
        this.skills.set('siren_upgraded', {
            id: 'sleepingbubble',
            name: 'Sleeping Bubble',
            nameKey: 'skill_sleeping_bubble_name',
            description: 'Fires a water bubble that puts enemies to sleep.',
            descriptionKey: 'skill_sleeping_bubble_desc',
            cooldown: 5000,
            logic: sleepingBubble
        });
 
        // 실비 (Silvi)
        this.skills.set('silvi', {
            id: 'stoneskin',
            name: 'Stone Skin',
            nameKey: 'skill_stone_skin_name',
            description: 'Reduces incoming damage by 25%.',
            descriptionKey: 'skill_stone_skin_desc',
            cooldown: 12000, // 12 seconds
            logic: stoneSkin
        });

        // 리아 (Ria)
        this.skills.set('ria', {
            id: 'windblade',
            name: 'Wind Blade',
            nameKey: 'skill_wind_blade_name',
            description: 'Temporary increases attack range to fire sword winds.',
            descriptionKey: 'skill_wind_blade_desc',
            cooldown: 15000, // 15 seconds
            logic: windBlade
        });

        // 자인 (Zayn)
        this.skills.set('zayn', {
            id: 'stealth',
            name: 'Stealth',
            nameKey: 'skill_stealth_name',
            description: 'Hides for a while, becoming untargetable.',
            descriptionKey: 'skill_stealth_desc',
            cooldown: 15000, // 15 seconds
            logic: stealth
        });

        // 주주 (Joojoo)
        this.skills.set('joojoo', {
            id: 'fire_totem_summon',
            name: 'Fire Totem Summon',
            nameKey: 'skill_fire_totem_name',
            description: 'Summons a Fire Totem that explodes on densest enemy area.',
            descriptionKey: 'skill_fire_totem_desc',
            cooldown: 10000, 
            logic: fireTotem
        });

        // 세인 (Sein)
        this.skills.set('sein', {
            id: 'tornado_shot',
            name: 'Tornado Shot',
            nameKey: 'skill_tornado_shot_name',
            description: 'Fires a spiral of projectiles.',
            descriptionKey: 'skill_tornado_shot_desc',
            cooldown: 10000,
            logic: tornadoShot
        });

        // 화염 토템 (Fire Totem)
        this.skills.set('fire_totem', {
            id: 'fire_burst',
            name: 'Fire Burst',
            nameKey: 'skill_fire_burst_name',
            description: 'Fires a fire ball that explodes on impact.',
            descriptionKey: 'skill_fire_burst_desc',
            cooldown: 8000, 
            logic: fireBurst
        });

        // 치유 토템 (Healing Totem)
        this.skills.set('healing_totem', {
            id: 'mass_heal',
            name: 'Mass Heal',
            nameKey: 'skill_mass_heal_name',
            description: 'Heals all allies by 1.5x MAtk.',
            descriptionKey: 'skill_mass_heal_desc',
            cooldown: 10000, 
            logic: massHeal
        });

        // 고블린 (Goblin) - 스킬 없음
        this.skills.set('goblin', {
            hasSkill: false
        });

        this.skills.set('goblin_shaman', {
            hasSkill: false
        });

        this.skills.set('goblin_wizard', {
            id: 'fire_burst',
            name: 'Fire Burst',
            nameKey: 'skill_fire_burst_name',
            description: 'Fires a fire ball that explodes on impact.',
            descriptionKey: 'skill_fire_burst_desc',
            cooldown: 6000, 
            logic: fireBurst
        });
    }

    /**
     * 유닛 아이디에 해당하는 스킬 정보 반환
     */
    getSkillData(id) {
        // [FIX] 1. 전체 ID로 먼저 시도 (baseId가 통째로 들어올 경우 대비)
        let skill = this.skills.get(id);
        
        // 2. 실패 시 인스턴스 ID 규칙(id_count)에 따라 baseId 추출 시도
        // 예: 'goblin_wizard_1' -> 'goblin_wizard'
        if (!skill && id) {
            const lastUnderscoreIndex = id.lastIndexOf('_');
            if (lastUnderscoreIndex !== -1) {
                const baseId = id.substring(0, lastUnderscoreIndex);
                skill = this.skills.get(baseId);
            }
        }
        
        if (!skill) {
            return { hasSkill: false };
        }
        
        return {
            hasSkill: true,
            scalingStat: skill.scalingStat || (skill.logic ? skill.logic.scalingStat : null),
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
