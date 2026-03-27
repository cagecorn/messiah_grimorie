import BaseMercenaryDBManager from './BaseMercenaryDBManager.js';

import Logger from '../../utils/Logger.js';

/** 니클(Nickle) 전용 인덱스DB 매니저 */
class NickleIndexDBManager extends BaseMercenaryDBManager {
    constructor() {
        super('nickle');
        Logger.system("NickleIndexDBManager: Storage initialized for Archer.");
    }
}

const nickleIndexDBManager = new NickleIndexDBManager();
export default nickleIndexDBManager;
