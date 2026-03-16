import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🕵️ 자인 전용 인덱스DB 매니저 */
class ZaynIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('zayn');
        Logger.system("ZaynIndexDBManager: Personal storage active.");
    }
}

const zaynIndexDBManager = new ZaynIndexDBManager();
export default zaynIndexDBManager;
