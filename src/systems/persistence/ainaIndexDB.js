import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';
import Logger from '../../utils/Logger.js';

/** ❄️ 아이나 전용 인덱스DB 매니저 */
class AinaIndexDB extends BaseMercenaryDBManager {
    constructor() {
        super('aina');
        Logger.system("AinaIndexDB: Ice Queen's storage active.");
    }
}

const ainaIndexDB = new AinaIndexDB();
export default ainaIndexDB;
