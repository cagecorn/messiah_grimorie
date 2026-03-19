import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🐻 바오 전용 인덱스DB 매니저 */
class BaoIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('bao');
        Logger.system("BaoIndexDBManager: Personal storage active.");
    }
}

const baoIndexDBManager = new BaoIndexDBManager();
export default baoIndexDBManager;
