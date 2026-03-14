import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🛡️ 엘라 전용 인덱스DB 매니저 */
class EllaIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('ella');
        Logger.system("EllaIndexDBManager: Personal storage active.");
    }
}

const ellaIndexDBManager = new EllaIndexDBManager();
export default ellaIndexDBManager;
