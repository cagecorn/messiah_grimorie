import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';
import StatManager from '../systems/entities/StatManager.js';
import ClassManager from '../systems/entities/ClassManager.js';
import LevelingManager from '../systems/entities/LevelingManager.js';
import StarGradeManager from '../systems/entities/StarGradeManager.js';
import BuffManager from '../systems/combat/BuffManager.js';
import StatusEffectManager from '../systems/combat/StatusEffectManager.js';
import ElementalManager from '../systems/combat/ElementalManager.js';
import ShieldManager from '../systems/combat/ShieldManager.js';

/**
 * 기본 엔티티 (Base Entity)
 * 역할: [모든 게임 월드 캐릭터/오브젝트의 최상위 클래스]
 * 
 * 설명: 스탯, 클래스, 레벨링, 성급, 전투 매니저를 하나로 통합합니다.
 */
export default class BaseEntity {
    constructor(config) {
        // [FIX] 모든 설정 값을 인스턴스에 복사하여 데이터 누락 방지 (dropTableId, baseRewardExp 등)
        Object.assign(this, config);
        this.config = config; // 백업용 저장

        const { id, baseId, name, type, className, isSpecial, level, exp, stars, baseStats } = config;

        this.id = id;
        this.baseId = baseId || (id ? id.split('_')[0] : type);
        this.name = name;
        this.type = type; 
        this._isDead = false; // 플래그 확실히 초기화

        // 시스템 컴포넌트 초기화 [RESTORED]
        this.stats = new StatManager();
        this.class = new ClassManager();
        this.leveling = new LevelingManager();
        this.grade = new StarGradeManager();

        // 전투 시스템 컴포넌트 [RESTORED]
        this.buffs = new BuffManager(this);
        this.status = new StatusEffectManager(this);
        this.elements = new ElementalManager(this);
        this.shields = new ShieldManager(this);

        // 초기화 시퀀스
        this.class.init(className, isSpecial);
        this.leveling.init(level, exp, id);
        this.grade.init(stars || 1);
        
        // 성급 배율을 스탯 시스템에 동기화
        this.stats.setStarMultiplier(this.grade.getMultiplier());
        this.stats.init(baseStats);

        // 레벨에 따른 초기 성장 적용
        if (this.leveling.getLevel() > 1) {
            this.applyGrowthForLevel(this.leveling.getLevel() - 1);
        }

        // [신규] 레벨업 시 스탯 자동 성장 연동
        EventBus.on(`ENTITY_LEVEL_UP_${this.id}`, () => {
            this.applyGrowthForLevel(1);
        });

        Logger.system(`BaseEntity Created: [${this.name}] Level ${this.leveling.getLevel()} ${this.class.getClassName()}`);
    }

    /**
     * 레벨업 시 스탯 성장 적용
     * @param {number} levelGain 증가한 레벨 수
     */
    applyGrowthForLevel(levelGain) {
        const growth = this.class.getGrowthValues();
        Object.entries(growth).forEach(([statKey, weight]) => {
            const increment = weight * levelGain;
            const currentBase = this.stats.baseStats[statKey] || 0;
            this.stats.update('base', statKey, currentBase + increment);
        });
    }

    /**
     * 성급 상승 (진급/합성)
     */
    promote() {
        const success = this.grade.promote();
        if (success) {
            // 배율 업데이트 및 스탯 재계산
            this.stats.setStarMultiplier(this.grade.getMultiplier());
            Logger.info("ENTITY", `${this.name} Promoted to ${this.grade.getStars()} Stars! Power Multiplier: ${this.grade.getMultiplier().toFixed(2)}x`);
        }
        return success;
    }

    // --- [통합 게터 (Unified Getters)] ---
    // 모든 전투 로직은 아래 게터를 통해 '최종 계산된 값'을 참조해야 합니다.

    getTotalAtk() { return this.stats.get('atk'); }
    getTotalMAtk() { return this.stats.get('mAtk'); }
    getTotalMaxHp() { return this.stats.get('maxHp'); }
    getTotalDef() { return this.stats.get('def'); }
    getTotalMDef() { return this.stats.get('mDef'); }
    getTotalCrit() { return this.stats.get('crit'); }
    getTotalSpeed() { return this.stats.get('speed'); }
    getTotalAtkSpd() { return this.stats.get('atkSpd'); }
    getTotalAcc() { return this.stats.get('acc'); }
    getTotalEva() { return this.stats.get('eva'); }
    getTotalAtkRange() { return this.stats.get('atkRange'); }

    // 단축 속성 (기존 코드 호환용 및 편의성)
    get hp() { return this.stats.get('hp'); }
    get atk() { return this.getTotalAtk(); }
    get shield() { return this.shields.getTotalShield(); }
    get isAlive() { return this.hp > 0 && !this._isDead; }

    get isDead() { return this._isDead; }
    set isDead(val) { this._isDead = val; }

    /**
     * 외부(전투 시스템 등)에서 호출하는 업데이트 루프
     */
    update(time, delta) {
        // [AI/공격 로직 등은 상속받은 클래스에서 구현]
    }
}
