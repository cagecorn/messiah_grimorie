import boonData from '../mercenaries/boon.js';

/**
 * 분 전용 로컬 저장소 스키마 (Boon IndexDB Schema)
 */
export const boonStoreSchema = {
    name: 'mercenary_boon',
    keyPath: 'id',
    initialData: [
        {
            id: 'boon_main',
            level: boonData.level,
            exp: boonData.exp,
            currentHp: boonData.baseStats.maxHp,
            stats: { ...boonData.baseStats },
            unlockedSkills: ['HolyAura'],
            isAquired: false
        }
    ]
};
