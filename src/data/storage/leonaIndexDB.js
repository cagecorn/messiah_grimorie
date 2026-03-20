import leonaData from '../mercenaries/leona.js';

/**
 * 레오나 전용 로컬 저장소 스키마 (Leona IndexDB Schema)
 */
export const leonaStoreSchema = {
    name: 'merc_leona',
    keyPath: 'id',
    initialData: [
        {
            id: 'leona_main',
            level: leonaData.level,
            exp: leonaData.exp,
            currentHp: leonaData.baseStats.maxHp,
            stats: { ...leonaData.baseStats },
            unlockedSkills: ['ElectricGrenade'],
            isAquired: false
        }
    ]
};
