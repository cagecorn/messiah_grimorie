import Logger from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';
import indexDBManager from '../core/IndexDBManager.js';

import arenDB from './persistence/ArenIndexDBManager.js';
import seraDB from './persistence/SeraIndexDBManager.js';
import ellaDB from './persistence/EllaIndexDBManager.js';
import merlinDB from './persistence/MerlinIndexDBManager.js';
import luteDB from './persistence/LuteIndexDBManager.js';
import silviDB from './persistence/SilviIndexDBManager.js';
import zaynDB from './persistence/ZaynIndexDBManager.js';
import riaDB from './persistence/riaIndexDB.js';
import joojooDB from './persistence/JoojooIndexDBManager.js';
import seinDB from './persistence/SeinIndexDBManager.js';

/**
 * 용병 수집 매니저 (Mercenary Collection Manager)
 * 역할: [소유권 및 컬렉션 데이터 관리]
 * 
 * 설명: 유저가 어떤 용병을 몇 장 가지고 있는지, 레벨/성은 얼마인지 기록합니다.
 * DB와 실시간 동기화되며, 하드코딩 없이 시스템적으로 용병을 추가/조회합니다.
 */
class MercenaryCollectionManager {
    constructor() {
        this.ownedMercenaries = new Map(); // key: id, value: { id, level, stars, count, ... }
        this.isInitialized = false;

        // [신규] 개별 DB 매니저 라우팅 맵
        this.dbManagers = {
            aren: arenDB,
            sera: seraDB,
            ella: ellaDB,
            merlin: merlinDB,
            lute: luteDB,
            silvi: silviDB,
            zayn: zaynDB,
            ria: riaDB,
            joojoo: joojooDB,
            sein: seinDB
        };
    }

    /**
     * 초기화 (DB에서 데이터 로드)
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // 1. 컬렉션 메타데이터 로드 (보유 목록)
            const data = await indexDBManager.getAll('mercenaries');
            
            // 2. [FIX] 각 용병별 상세 데이터(진행도) 병합 로드
            for (const merc of data) {
                const id = merc.id.toLowerCase();
                const dbManager = this.dbManagers[id];
                if (dbManager) {
                    const detailedData = await dbManager.loadData();
                    if (detailedData) {
                        // 기존 메타데이터에 진행도(레벨, 경험치 등) 덮어쓰기
                        Object.assign(merc, detailedData);
                    }
                }
                this.ownedMercenaries.set(id, merc);
            }

            this.isInitialized = true;
            Logger.system(`MercenaryCollectionManager: Initialized (${this.ownedMercenaries.size} owned with detailed progress).`);
            EventBus.emit('COLLECTION_LOADED', { count: this.ownedMercenaries.size });
        } catch (err) {
            Logger.error("COLLECTION_MANAGER", `Initialization failed: ${err.message}`);
        }
    }

    /**
     * 용병 획득 (가챠나 스타터팩)
     */
    async addMercenary(mercId, amount = 1) {
        const id = mercId.toLowerCase();
        let merc = this.ownedMercenaries.get(id);

        if (merc) {
            merc.count += amount;
        } else {
            // 신규 획득
            merc = {
                id: id,
                level: 1,
                stars: 1,
                count: amount,
                acquiredAt: Date.now()
            };
        }

        this.ownedMercenaries.set(id, merc);
        await indexDBManager.save('mercenaries', merc);
        
        Logger.info("COLLECTION", `Acquired/Updated mercenary: ${id} (Total: ${merc.count})`);
        EventBus.emit('COLLECTION_UPDATED', { mercId: id, data: merc });
    }

    /**
     * 소유 여부 확인
     */
    isOwned(mercId) {
        return this.ownedMercenaries.has(mercId.toLowerCase());
    }

    /**
     * 보유 리스트 반환
     */
    getOwnedList() {
        return Array.from(this.ownedMercenaries.values());
    }

    /**
     * 특정 용병 데이터 반환
     */
    getMercenaryData(mercId) {
        return this.ownedMercenaries.get(mercId.toLowerCase());
    }

    /**
     * [신규] 전투 중 획득한 경험치/레벨 실시간 동기화
     */
    async updateMercenaryProgress(mercId, level, exp) {
        const id = mercId.toLowerCase();
        const merc = this.ownedMercenaries.get(id);
        
        if (!merc) return;

        merc.level = level;
        merc.exp = exp;

        // [STABLE] 개별 전용 DB 매니저로 라우팅하여 저장
        const dbManager = this.dbManagers[id];
        if (dbManager) {
            await dbManager.saveData(merc);
        } else {
            // 특수 유닛이나 임시 유닛의 경우 기존 공용 저장소 활용 가능
            await indexDBManager.save('mercenaries', merc);
        }
    }
}

const mercenaryCollectionManager = new MercenaryCollectionManager();
export default mercenaryCollectionManager;
