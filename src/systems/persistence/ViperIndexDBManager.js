import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🐍 바이퍼 전용 인덱스DB 매니저 */
class ViperIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('viper');
        Logger.system("ViperIndexDBManager: Personal storage active.");
    }
}

const viperIndexDBManager = new ViperIndexDBManager();
export default viperIndexDBManager;
