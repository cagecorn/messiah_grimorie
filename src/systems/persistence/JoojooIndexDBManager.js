import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** 🗿 주주 전용 인덱스DB 매니저 */
class JoojooIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('joojoo');
        Logger.system("JoojooIndexDBManager: Personal storage active.");
    }
}

const joojooIndexDBManager = new JoojooIndexDBManager();
export default joojooIndexDBManager;
