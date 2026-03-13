import Logger from '../../utils/Logger.js';
import healthBarManager from './HealthBarManager.js';
import damageTextManager from './DamageTextManager.js';

/**
 * FX 매니저 (FX Manager)
 * 역할: [전문화된 시각 효과 유닛들을 총괄하는 컨트롤 타워]
 * 
 * 설명: HP바, 데미지 텍스트, 상태 아이콘 등 전장에서 발생하는 
 * 모든 '동적 연출 요소를 풀링하고 업데이트합니다.
 */
class FXManager {
    constructor() {
        this.isInitialized = false;
        this.scene = null;
    }

    /**
     * 매니저 초기화 및 하위 매니저 연동
     */
    init(scene) {
        this.scene = scene;
        
        // 1. 하위 매니저 초기화
        healthBarManager.init(scene);
        damageTextManager.init(scene);
        
        this.isInitialized = true;
        Logger.system("FXManager: Central Command Tower initialized.");
    }

    /**
     * 데미지 텍스트 출력 요청
     */
    showDamageText(x, y, amount, type) {
        if (!this.isInitialized) return;
        damageTextManager.showDamage(x, y, amount, type);
    }

    /**
     * 엔티티에 시각적 요소 부착
     */
    attachHUD(entity) {
        if (!this.isInitialized) return;
        
        // HP바 생성 및 부착
        const hpBar = healthBarManager.createBar(entity);
        entity.hpBar = hpBar;
    }

    /**
     * 엔티티에서 시각적 요소 제거
     */
    detachHUD(entity) {
        if (entity.hpBar) {
            healthBarManager.releaseBar(entity.hpBar);
            entity.hpBar = null;
        }
    }

    /**
     * 전체 FX 시스템 업데이트
     */
    update(time, delta) {
        if (!this.isInitialized) return;
        
        // HP바 업데이트 (위치 + 렌더링)
        healthBarManager.update();
    }
}

const fxManager = new FXManager();
export default fxManager;
