import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🏹 세라 전용 인덱스DB 매니저 */
class SeraIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('sera');
        Logger.system("SeraIndexDBManager: Personal storage active.");
    }
}

const seraIndexDBManager = new SeraIndexDBManager();
export default seraIndexDBManager;
