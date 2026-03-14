import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🪄 멀린 전용 인덱스DB 매니저 */
class MerlinIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('merlin');
        Logger.system("MerlinIndexDBManager: Personal storage active.");
    }
}

const merlinIndexDBManager = new MerlinIndexDBManager();
export default merlinIndexDBManager;
