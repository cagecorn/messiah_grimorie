import Logger from '../utils/Logger.js';
import measurementManager from './MeasurementManager.js';

/**
 * 유닛 픽셀 사이즈 매니저 (Unit Pixel Size Manager)
 * 역할: [라우터 (Router) & 데이터 규격 통제관]
 * 
 * 설명: 유닛별로 상이한 픽셀 사이즈와 그에 따른 피격 박스(Hitbox) 연산을 총괄합니다.
 * 용병, 몬스터, 보스 등 각 객체의 실제 스케일과 물리 연산용 사이즈를 매칭합니다.
 */
class UnitPixelSizeManager {
    constructor() {
        Logger.system("UnitPixelSizeManager: Initialized (Hitbox scaling ready).");
    }

    /**
     * 유닛 타입에 따른 물리/피격 박스 사이즈 라우팅
     * @param {string} type 'mercenary', 'monster', 'boss'
     * @returns {object} { width, height, hitScale }
     */
    getCollisionSize(type) {
        const baseSize = measurementManager.get('entity', type);
        
        if (!baseSize) {
            Logger.warn("SIZE_MANAGER", `Unknown unit type: ${type}`);
            return { width: 32, height: 32, hitScale: 1.0 };
        }

        // 보스 유닛의 경우 피격 박스를 시각적 크기에 맞춰 2배로 확장하는 등의 특수 로직
        let hitScale = 1.0;
        if (type === 'boss') {
            hitScale = 2.0; 
        }

        return {
            width: baseSize.width * baseSize.scale * hitScale,
            height: baseSize.height * baseSize.scale * hitScale,
            hitScale: hitScale
        };
    }

    /**
     * 특정 유닛 객체에 사이즈 규격 적용
     */
    applySizeToUnit(unit, type) {
        const metrics = this.getCollisionSize(type);
        if (unit.body) {
            unit.body.setSize(metrics.width, metrics.height);
        }
        Logger.info("SIZE_MANAGER", `Applied ${type} metrics to unit.`);
    }
}

const unitPixelSizeManager = new UnitPixelSizeManager();
export default unitPixelSizeManager;
