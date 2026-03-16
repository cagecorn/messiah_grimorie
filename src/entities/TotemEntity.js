import Logger from '../utils/Logger.js';
import { ENTITY_CLASSES, STAT_KEYS } from '../core/EntityConstants.js';
import BaseEntity from './BaseEntity.js';

/**
 * 토템 엔티티 논리 데이터 (Totem Entity Logic Data)
 */
class TotemLogic extends BaseEntity {
    constructor(config) {
        super(config);
        this.master = config.master || null;
        this.isTotem = true;
    }
}

export default TotemLogic;
