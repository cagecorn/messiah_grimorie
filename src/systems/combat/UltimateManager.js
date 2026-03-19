import forMessiah from './skills/ForMessiah.js';
import threadsOfFate from './skills/ThreadsOfFate.js';
import summonGuardianAngel from './skills/SummonGuardianAngel.js';
import meteorStrike from './skills/MeteorStrike.js';
import summonSiren from './skills/SummonSiren.js';
import imSorry from './skills/ImSorry.js';
import cloning from './skills/Cloning.js';
import battoJutsu from './skills/BattoJutsu.js';
import healingTotem from './skills/HealingTotem.js';
import iceStorm from './skills/IceStorm.js';
import babao from './skills/Babao.js';

/**
 * 궁극기 매니저 (Ultimate Manager)
 * 역할: [유닛별 궁극기 데이터 관리 및 충전 로직 총괄]
 */
class UltimateManager {
    constructor() {
        this.ultimates = new Map();
        this.initializeDefaultUltimates();
    }

    /**
     * 기본 궁극기 데이터 정의
     */
    initializeDefaultUltimates() {
        // ==========================================
        // ⚔️ [Warrior Class] 아렌 (Aren)
        // ==========================================
        this.ultimates.set('aren', {
            id: 'aren_ult',
            nameKey: 'ult_aren_name',
            descriptionKey: 'ult_aren_desc',
            chargeMax: 100, 
            chargeSpeedBase: 1.0, 
            logic: forMessiah 
        });

        // 🌿 [Healer Class] 세라 (Sera)
        this.ultimates.set('sera', {
            id: 'sera_ult',
            nameKey: 'ult_sera_name',
            descriptionKey: 'ult_sera_desc',
            chargeMax: 100,
            chargeSpeedBase: 1.0,
            logic: summonGuardianAngel
        });

        // 엘라 (Ella)
        this.ultimates.set('ella', {
            id: 'ella_ult',
            nameKey: 'ult_ella_name',
            descriptionKey: 'ult_ella_desc',
            chargeMax: 100,
            chargeSpeedBase: 1.0,
            logic: threadsOfFate
        });

        // 🔮 [Wizard Class] 멀린 (Merlin)
        this.ultimates.set('merlin', {
            id: 'merlin_ult',
            nameKey: 'ult_merlin_name',
            descriptionKey: 'ult_merlin_desc',
            chargeMax: 100,
            chargeSpeedBase: 1.0,
            logic: meteorStrike
        });

        // 루트 (Lute)
        this.ultimates.set('lute', {
            id: 'lute_ult',
            nameKey: 'ult_lute_name',
            descriptionKey: 'ult_lute_desc',
            chargeMax: 100,
            chargeSpeedBase: 1.0,
            logic: summonSiren
        });
 
        // 실비 (Silvi)
        this.ultimates.set('silvi', {
            id: 'silvi_ult',
            nameKey: 'ult_silvi_name',
            descriptionKey: 'ult_silvi_desc',
            chargeMax: 100,
            chargeSpeedBase: 1.0,
            logic: imSorry
        });

        // 자인 (Zayn)
        this.ultimates.set('zayn', {
            id: 'zayn_ult',
            nameKey: 'ult_zayn_name',
            descriptionKey: 'ult_zayn_desc',
            chargeMax: 100,
            chargeSpeedBase: 1.2,
            logic: cloning
        });

        // 리아 (Ria)
        this.ultimates.set('ria', {
            id: 'ria_ult',
            nameKey: 'ult_ria_name',
            descriptionKey: 'ult_ria_desc',
            chargeMax: 100,
            chargeSpeedBase: 1.0,
            logic: battoJutsu
        });

        // 주주 (Joojoo)
        this.ultimates.set('joojoo', {
            id: 'joojoo_ult',
            nameKey: 'ult_joojoo_name',
            descriptionKey: 'ult_joojoo_desc',
            chargeMax: 100,
            chargeSpeedBase: 1.0,
            logic: healingTotem
        });

        // 아이나 (Aina)
        this.ultimates.set('aina', {
            id: 'aina_ult',
            nameKey: 'ult_aina_name',
            descriptionKey: 'ult_aina_desc',
            chargeMax: 100,
            chargeSpeedBase: 1.0,
            logic: iceStorm
        });

        // 바오 (Bao)
        this.ultimates.set('bao', {
            id: 'bao_ult',
            nameKey: 'ult_bao_name',
            descriptionKey: 'ult_bao_desc',
            chargeMax: 100,
            chargeSpeedBase: 1.1,
            logic: babao
        });

        // 고블린(몬스터)은 궁극기 없음
        this.ultimates.set('goblin', {
            hasUltimate: false
        });
    }

    /**
     * 유닛 아이디에 해당하는 궁극기 정보 반환
     */
    getUltimateData(id) {
        const baseId = id.split('_')[0];
        const ult = this.ultimates.get(baseId);
        
        if (!ult || ult.hasUltimate === false) {
            return { hasUltimate: false };
        }
        
        return {
            hasUltimate: true,
            scalingStat: ult.scalingStat || (ult.logic ? ult.logic.scalingStat : null),
            ...ult
        };
    }
}

const ultimateManager = new UltimateManager();
export default ultimateManager;
