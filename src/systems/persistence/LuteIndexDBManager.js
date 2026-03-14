import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🎶 루트 전용 인덱스DB 매니저 */
class LuteIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('lute');
        Logger.system("LuteIndexDBManager: Personal storage active.");
    }
}

const luteIndexDBManager = new LuteIndexDBManager();
export default luteIndexDBManager;
