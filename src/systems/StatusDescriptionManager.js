import localizationManager from '../core/LocalizationManager.js';
import Logger from '../utils/Logger.js';

/**
 * 상태 설명 매니저 (Status Description Manager)
 * 역할: [상태 효과의 동적 텍스트 생성 및 포맷팅]
 * 
 * 설명: 버프, 디버프, 보호막 등의 상세 설명을 실시간 수치를 포함하여 생성합니다.
 */
class StatusDescriptionManager {
    constructor() {}

    /**
     * 상태 효과에 대한 상세 설명을 생성합니다.
     * @param {string} statusId 아이콘 ID (예: 'inspiration', 'shield')
     * @param {Object} data CharacterStatusManager에서 생성한 개별 아이콘 데이터
     */
    getDescription(statusId, data = {}) {
        const templateKey = `status_desc_${statusId}`;
        let description = localizationManager.t(templateKey);

        // 번역이 없는 경우 기본값 처리
        if (description === templateKey) {
            description = localizationManager.t(`status_desc_unknown`) || 'No description available.';
        }

        // 수치 치환 {value}
        if (data.value !== undefined) {
            let displayValue = Math.floor(data.value);
            
            // 퍼센트 전용 처리 (stoneskin 등)
            if (statusId === 'stoneskin') {
                displayValue = Math.floor(data.value * 100);
            }

            description = description.replace('{value}', displayValue);
        }

        return description;
    }

    /**
     * 상태 아이콘 클릭 시 호출될 제목 반환
     */
    getTitle(statusId) {
        // ID의 첫 글자를 대문자로 하거나 별도 번역 키 활용
        const titleKey = `status_title_${statusId}`;
        const title = localizationManager.t(titleKey);
        
        if (title === titleKey) {
            return statusId.charAt(0).toUpperCase() + statusId.slice(1);
        }
        return title;
    }
}

const statusDescriptionManager = new StatusDescriptionManager();
export default statusDescriptionManager;
