import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🛡️ 성기사 분(Boon) 전용 인덱스DB 매니저 */
class BoonIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('boon');
        Logger.system("BoonIndexDBManager: Personal storage active.");
    }
}

const boonIndexDBManager = new BoonIndexDBManager();
export default boonIndexDBManager;
