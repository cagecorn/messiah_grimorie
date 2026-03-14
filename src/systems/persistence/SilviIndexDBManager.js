import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🌿 실비 전용 인덱스DB 매니저 */
class SilviIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('silvi');
        Logger.system("SilviIndexDBManager: Personal storage active.");
    }
}

const silviIndexDBManager = new SilviIndexDBManager();
export default silviIndexDBManager;
