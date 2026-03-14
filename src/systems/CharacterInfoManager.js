import Logger from '../utils/Logger.js';
import EventBus, { EVENTS } from '../core/EventBus.js';
import mercenaryManager from './entities/MercenaryManager.js';
import monsterManager from './entities/MonsterManager.js';

/**
 * 캐릭터 인포 매니저 (Character Info Manager)
 * 역할: [정보창 데이터 조율 및 실시간 정보 공유]
 * 
 * 설명: 현재 클릭해서 보고 있는 캐릭터가 누구인지, 
 * 해당 캐릭터의 출처(컬렉션/전투)가 어디인지 관리합니다.
 */
class CharacterInfoManager {
    constructor() {
        this.currentTarget = null;
        this.source = null; // 'collection' | 'combat'
        
        Logger.system("CharacterInfoManager: Ready to share real-time data.");
    }

    /**
     * 상세 정보창을 띄울 유닛 설정
     * @param {object} character 유닛 데이터 혹은 CombatEntity
     * @param {string} source 데이터 출처
     */
    setTarget(character, source = 'collection') {
        this.currentTarget = character;
        this.source = source;
        const name = this.getName(); // 이제 currentTarget이 설정되었으므로 이름 추출 가능
        console.log(`[CharacterInfoManager] Setting target: ${name}, Source: ${source}`);
        EventBus.emit(EVENTS.CHARACTER_INFO_OPEN, character);
    }

    clearTarget() {
        this.currentTarget = null;
        EventBus.emit(EVENTS.CHARACTER_INFO_CLOSE);
    }

    /**
     * UI 표시를 위한 이름 추출
     */
    getName() {
        if (!this.currentTarget) return '';
        
        // 1. CombatEntity logic 우선
        if (this.currentTarget.logic && this.currentTarget.logic.name) {
            return this.currentTarget.logic.name;
        }
        
        // 2. 직접 name 속성 (PortraitHUDCard 등)
        if (this.currentTarget.name) return this.currentTarget.name;

        // 3. Roster/Registry 데이터 (id만 있는 경우) -> 레지스트리 검색
        const id = this.getId();
        const logic = this.currentTarget.logic;
        
        // [신규] 소환수/몬스터 타입 핸들링 강화
        if (logic && logic.type === 'monster') {
            const monsterData = monsterManager.registry[id];
            return monsterData ? monsterData.name : (logic.name || 'Unknown Monster');
        } else if (logic && logic.type === 'summon') {
            return logic.name || 'Unknown Summon';
        }

        const registryData = mercenaryManager.registry[id];
        return registryData ? registryData.name : 'Unknown';
    }

    /**
     * UI 표시를 위한 ID 추출
     */
    getId() {
        if (!this.currentTarget) return '';
        const logic = this.currentTarget.logic;
        
        // [수정] baseId가 있으면 '가공된 ID'이므로 그대로 반환 (guardian_angel 등 보존)
        if (logic && logic.baseId) return logic.baseId.toLowerCase();

        const fullId = logic ? logic.id : this.currentTarget.id;
        if (!fullId) return '';

        // [수정] 언더바 뒤에 '숫자'가 오는 경우만 인스턴스 접미사로 간주하여 제거
        // 예: aren_1 -> aren, guardian_angel -> guardian_angel
        return fullId.replace(/_\d+$/, '').toLowerCase();
    }

    /**
     * UI 표시를 위한 타입 추출
     */
    getType() {
        if (!this.currentTarget) return 'unknown';
        const logic = this.currentTarget.logic || this.currentTarget;
        if (logic.type) return logic.type;

        // 타입이 명시되지 않은 경우 ID로 추론 (레지스트리 우선)
        const id = this.getId();
        if (mercenaryManager.registry[id]) return 'mercenary';
        if (monsterManager.registry[id]) return 'monster';

        return 'unknown';
    }

    /**
     * 레벨링 데이터 추출 (CombatEntity 혹은 Collection 데이터)
     */
    getLeveling() {
        if (!this.currentTarget) return null;
        
        // 1. 전투 중인 유닛 (logic.leveling 존재)
        if (this.currentTarget.logic?.leveling) return this.currentTarget.logic.leveling;

        // 2. 컬렉션 데이터 (자체적으로 level, exp 보유)
        // Note: ownedMercenaries에서 가져온 데이터는 name/type이 없을 수 있음
        const level = this.currentTarget.level;
        if (level !== undefined) {
            return {
                exp: this.currentTarget.exp || 0,
                maxExp: this.calculateMaxExp(level),
                getLevel: () => level
            };
        }

        return null;
    }

    /**
     * 레벨별 최대 경험치 계산 (LevelingManager와 동일한 공식 유지)
     */
    calculateMaxExp(level) {
        const base = 100;
        return Math.floor(base * Math.pow(level, 1.7));
    }
}

const characterInfoManager = new CharacterInfoManager();
export default characterInfoManager;
