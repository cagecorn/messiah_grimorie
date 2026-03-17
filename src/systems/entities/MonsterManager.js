import Logger from '../../utils/Logger.js';
import BaseEntity from '../../entities/BaseEntity.js';
import instanceIDManager from '../../utils/InstanceIDManager.js';

// [데이터 로드] 초기 몬스터 라인업
import goblin from '../../data/monsters/goblin.js';
import goblin_shaman from '../../data/monsters/goblin_shaman.js';
import goblin_wizard from '../../data/monsters/goblin_wizard.js';
import goblin_flyingman from '../../data/monsters/goblin_flyingman.js';
import goblin_rogue from '../../data/monsters/goblin_rogue.js'; // [NEW]

/**
 * 몬스터 매니저 (Monster Manager)
 * 역할: [적 유닛(몬스터)의 생성 및 관리]
 */
class MonsterManager {
    constructor() {
        this.monsters = new Map();

        // [ID 관리] 고정 ID 레지스트리
        this.registry = {
            goblin,
            goblin_shaman,
            goblin_wizard,
            goblin_flyingman,
            goblin_rogue // [NEW]
        };

        Logger.system("MonsterManager: Registry initialized.");
    }

    /**
     * 레지스트리에서 ID를 기반으로 새로운 몬스터 인스턴스 생성
     */
    spawn(monsterId, customConfig = {}) {
        const baseData = this.registry[monsterId.toLowerCase()];
        if (!baseData) {
            Logger.error("MONSTER_MANAGER", `Monster ID not found: ${monsterId}`);
            return null;
        }

        // 1. 고유 인스턴스 ID 생성 (고블린 1, 고블린 2...)
        const uniqueId = instanceIDManager.generate(monsterId.toLowerCase());

        // 2. 기본 데이터와 커스텀 설정을 병합
        const config = { 
            level: 1,
            ...baseData, 
            ...customConfig,
            baseId: monsterId.toLowerCase(), // [FIX] 베이스 ID 명시
            id: uniqueId, // 베이스 ID를 고유 ID로 덮어씌움
            type: 'monster' // [FIX] 타입 명시
        };

        // [USER 요청] 엘리트 몬스터의 경우 이름 앞에 'Elite' 접두사 추가
        if (config.isElite) {
            import('../../core/LocalizationManager.js').then(m => {
                const prefix = m.default.t('elite');
                config.name = `${prefix} ${config.name || baseData.name}`;
            });
            // 동기적으로도 일단 설정 (임시)
            config.name = `Elite ${config.name || baseData.name}`;
        }

        return this.createMonster(config);
    }

    /**
     * 새로운 몬스터 생성
     */
    createMonster(config) {
        const monster = new BaseEntity(config);
        
        // 고유 ID는 이미 config.id에 들어있음 (BaseEntity.id)
        this.monsters.set(monster.id, monster);
        
        return monster;
    }

    removeMonster(instanceId) {
        this.monsters.delete(instanceId);
    }
}

const monsterManager = new MonsterManager();
export default monsterManager;
