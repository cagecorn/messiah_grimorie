import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';
import indexDBManager from '../core/IndexDBManager.js';
import mercenaryCollectionManager from './MercenaryCollectionManager.js';

/**
 * 스타터 팩 매니저 (Starter Pack Manager)
 * 역할: [신규 유저 정착 지원]
 * 
 * 설명: 최초 게임 시작 시 필요한 용병, 재화 등을 자동으로 지급합니다.
 * 중복 지급 방지를 위해 DB에 지급 여부를 기록합니다.
 */
class StarterPackManager {
    constructor() {
        this.packId = 'WELCOME_PACK_2026';
    }

    /**
     * 스타터 팩 지급 체크 및 실행
     */
    async checkAndAward() {
        try {
            // 이미 지급되었는지 확인
            const record = await indexDBManager.load('messiahData', this.packId);
            if (record && record.claimed) {
                Logger.info("STARTER_PACK", "Starter pack already claimed.");
                return;
            }

            Logger.system("STARTER_PACK: New user detected! Awarding starter mercenaries.");

            // [하드코딩 제거] 시스템적으로 지급할 용병 ID 리스트
            const starterMercs = ['aren', 'ella', 'sera', 'merlin', 'lute', 'silvi'];
            
            for (const id of starterMercs) {
                await mercenaryCollectionManager.addMercenary(id, 1);
            }

            // 지급 완료 기록 저장
            await indexDBManager.save('messiahData', { id: this.packId, claimed: true, claimedAt: Date.now() });
            
            Logger.info("STARTER_PACK", "Successfully awarded 6 starter mercenaries.");
            EventBus.emit('STARTER_PACK_AWARDED');
        } catch (err) {
            Logger.error("STARTER_PACK", `Failed to award starter pack: ${err.message}`);
        }
    }
}

const starterPackManager = new StarterPackManager();
export default starterPackManager;
