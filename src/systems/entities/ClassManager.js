import Logger from '../../utils/Logger.js';
import { ENTITY_CLASSES, CLASS_GROWTH, SPECIAL_GROWTH } from '../../core/EntityConstants.js';

/**
 * 클래스 매니저 (Class Manager)
 * 역할: [엔티티의 직업별 특성 및 성장 곡선 관리]
 */
class ClassManager {
    constructor() {
        this.currentClass = ENTITY_CLASSES.BARD; // 기본값
        this.isSpecialType = false; // '분'과 같은 특이 케이스 여부
    }

    init(className, isSpecial = false) {
        this.currentClass = className;
        this.isSpecialType = isSpecial;
        Logger.info("ENTITY_CLASS", `Class set to: ${className} (Special: ${isSpecial})`);
    }

    /**
     * 해당 클래스의 레벨업 당 스탯 상승분 반환
     */
    getGrowthValues() {
        if (this.isSpecialType && SPECIAL_GROWTH.PALADIN_TYPE) {
            return SPECIAL_GROWTH.PALADIN_TYPE;
        }
        return CLASS_GROWTH[this.currentClass] || CLASS_GROWTH[ENTITY_CLASSES.BARD];
    }

    /**
     * 클래스 이름 반환
     */
    getClassName() {
        return this.currentClass;
    }
}

export default ClassManager;
