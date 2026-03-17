import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🕊️ 세인 전용 인덱스DB 매니저 */
class SeinIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('sein');
        Logger.system("SeinIndexDBManager: Personal storage active.");
    }
}

const seinIndexDBManager = new SeinIndexDBManager();
export default seinIndexDBManager;
