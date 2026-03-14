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
        const name = character?.logic?.name || character?.name || 'Unknown';
        console.log(`[CharacterInfoManager] Setting target: ${name}, Source: ${source}`);
        this.currentTarget = character;
        this.source = source;
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
}

const characterInfoManager = new CharacterInfoManager();
export default characterInfoManager;
