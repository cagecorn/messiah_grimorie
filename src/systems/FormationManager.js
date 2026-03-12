import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';
import formationDBManager from './persistence/FormationDBManager.js';

/**
 * 편성 매니저 (Formation Manager)
 * 역할: [팀 구성 및 전략 관리]
 * 
 * 설명: 최대 6명의 용병을 파티에 배치하고 관리합니다.
 * 슬롯은 0~5번까지 인덱스로 관리됩니다.
 */
class FormationManager {
    constructor() {
        // [규칙] 최대 6인 편성 (null은 빈 슬롯)
        this.currentFormation = new Array(6).fill(null);
        this.formationId = 'primary_party'; // 기본 파티 ID
        Logger.system("FormationManager: Initialized (6-Slot Strategy Hub).");
    }

    /**
     * DB에서 편성 정보 로드 및 초기화
     */
    async initialize() {
        const savedSlots = await formationDBManager.loadFormation(this.formationId);
        if (savedSlots) {
            this.currentFormation = savedSlots;
            Logger.info("FORMATION", "Previous formation restored.");
        } else {
            Logger.info("FORMATION", "No saved formation found. Starting empty.");
        }
        
        // 초기 렌더링을 위한 이벤트 발생
        EventBus.emit('FORMATION_UPDATED', { formation: [...this.currentFormation] });
    }

    /**
     * 현쟈 편성 강제 저장
     */
    async save() {
        await formationDBManager.saveFormation(this.formationId, this.currentFormation);
    }

    /**
     * 특정 슬롯에 용병 배치
     * @param {number} slotIndex 0 ~ 5
     * @param {string} mercenaryId 
     */
    assignMercenary(slotIndex, mercenaryId) {
        if (slotIndex < 0 || slotIndex >= 6) return;

        // [보험] 이미 다른 슬롯에 배치된 경우 해당 슬롯 비우기 (중복 방지)
        const prevSlotIndex = this.currentFormation.indexOf(mercenaryId);
        if (prevSlotIndex !== -1) {
            this.currentFormation[prevSlotIndex] = null;
        }

        this.currentFormation[slotIndex] = mercenaryId;
        Logger.info("FORMATION", `Assigned ${mercenaryId} to Slot ${slotIndex}`);
        
        EventBus.emit('FORMATION_UPDATED', { formation: [...this.currentFormation] });
        this.save();
    }

    /**
     * 특정 슬롯 비우기
     */
    removeMercenary(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 6) return;
        this.currentFormation[slotIndex] = null;
        EventBus.emit('FORMATION_UPDATED', { formation: [...this.currentFormation] });
        this.save();
    }

    /**
     * 두 슬롯의 유닛 교체
     */
    swapSlots(idxA, idxB) {
        [this.currentFormation[idxA], this.currentFormation[idxB]] = [this.currentFormation[idxB], this.currentFormation[idxA]];
        EventBus.emit('FORMATION_UPDATED', { formation: [...this.currentFormation] });
        this.save();
    }

    getFormation() {
        return [...this.currentFormation];
    }
}

const formationManager = new FormationManager();
export default formationManager;
