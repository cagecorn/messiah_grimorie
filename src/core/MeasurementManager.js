/**
 * 측량 매니저 (Measurement Manager)
 * 게임 내 모든 [사이즈]와 [수치]를 중앙에서 관리합니다.
 * 픽셀 사이즈 변경 시 이 파일만 수정하면 모든 곳에 반영됩니다.
 */
class MeasurementManager {
    constructor() {
        // [구역 1] 화면 및 캔버스 설정
        this.screen = {
            width: 1280,
            height: 720,
            zoom: 1.0
        };

        // [구역 2] 엔티티 픽셀 사이즈 (용병 & 몬스터)
        this.entity = {
            mercenary: {
                width: 64,
                height: 64,
                scale: 1.0
            },
            monster: {
                width: 64,
                height: 64,
                scale: 1.2 // 몬스터는 용병보다 약간 큼
            },
            boss: {
                width: 128,
                height: 128,
                scale: 2.0
            }
        };

        // [구역 3] UI 및 폰트 사이즈
        this.ui = {
            fontSizeTitle: '48px',
            fontSizeNormal: '24px',
            fontSizeSmall: '16px',
            padding: 20
        };
    }

    /**
     * 특정 카테고리의 수치를 가져옵니다.
     */
    get(category, subKey = null) {
        if (!this[category]) return null;
        if (subKey && this[category][subKey]) return this[category][subKey];
        return this[category];
    }
}

const measurementManager = new MeasurementManager();
export default measurementManager;
