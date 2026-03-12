import Logger from '../../utils/Logger.js';
import BaseEntity from '../../entities/BaseEntity.js';

/**
 * 방어 시설 매니저 (Defense Structure Manager)
 * 역할: [고정형 방어 타워 및 시설물 관리]
 */
class DefenseStructureManager {
    constructor() {
        this.structures = new Map();
    }

    buildStructure(config) {
        const struct = new BaseEntity({
            ...config,
            type: 'structure'
        });
        this.structures.set(struct.id, struct);
        return struct;
    }
}

const defenseStructureManager = new DefenseStructureManager();
export default defenseStructureManager;
