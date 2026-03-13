import Logger from '../../utils/Logger.js';
import forMessiah from './skills/ForMessiah.js';

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
            name: 'For Messiah!', // Naming update
            description: '"For Messiah!"',
            // 궁극기는 쿨다운이 아닌 충전 방식이므로 게이지 최대값을 정의 (또는 1.0 기준)
            chargeMax: 100, 
            chargeSpeedBase: 1.0, // 기본 충전 배율
            logic: forMessiah 
        });

        // 엘라 (Ella)
        this.ultimates.set('ella', {
            id: 'ella_ult',
            name: 'Spirit Arrow',
            description: 'Fires a rain of spirit arrows.',
            chargeMax: 100,
            chargeSpeedBase: 1.0,
            logic: null // 추후 구현
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
            ...ult
        };
    }
}

const ultimateManager = new UltimateManager();
export default ultimateManager;
