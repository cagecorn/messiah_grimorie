import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** ⚔️ 아렌 전용 인덱스DB 매니저 */
class ArenIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('aren');
        Logger.system("ArenIndexDBManager: Personal storage active.");
    }
}

const arenIndexDBManager = new ArenIndexDBManager();
export default arenIndexDBManager;
