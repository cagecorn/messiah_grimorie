import Logger from '../../utils/Logger.js';
import BaseEntity from '../../entities/BaseEntity.js';
import instanceIDManager from '../../utils/InstanceIDManager.js';

// [데이터 로드] 초기 몬스터 라인업
import goblin from '../../data/monsters/goblin.js';
import goblin_shaman from '../../data/monsters/goblin_shaman.js';

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
            goblin_shaman
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
            id: uniqueId, // 베이스 ID를 고유 ID로 덮어씌움
            type: 'monster' // [FIX] 타입 명시
        };

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
