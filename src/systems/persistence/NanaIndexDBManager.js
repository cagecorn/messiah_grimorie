import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🎶 나나(Nana) 전역 인덱스DB 매니저 */
class NanaIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('nana');
        Logger.system("NanaIndexDBManager: Storage initialized for Bard.");
    }
}

const nanaIndexDBManager = new NanaIndexDBManager();
export default nanaIndexDBManager;
