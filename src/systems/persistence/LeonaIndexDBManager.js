import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** ⚡ 아처 레오나(Leona) 전용 인덱스DB 매니저 */
class LeonaIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('leona');
        Logger.system("LeonaIndexDBManager: Personal storage active.");
    }
}

const leonaIndexDBManager = new LeonaIndexDBManager();
export default leonaIndexDBManager;
