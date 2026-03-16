import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** ⚔️ 리아 전용 인덱스DB 매니저 */
class RiaIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('ria');
        Logger.system("RiaIndexDBManager: Personal storage active.");
    }
}

const riaIndexDBManager = new RiaIndexDBManager();
export default riaIndexDBManager;
