/**
 * 측량 매니저 (Measurement Manager)
 * 게임 내 모든 [사이즈]와 [수치]를 중앙에서 관리합니다.
 * 픽셀 사이즈 변경 시 이 파일만 수정하면 모든 곳에 반영됩니다.
 */
class MeasurementManager {
    constructor() {
        // [구역 1] 화면 및 월드 설정 (Dungeon Dimensions)
        this.world = {
            width: 2304,
            height: 1536,
            bgScale: 1.5 // 1536x1024 배경을 1.5배 스케일링
        };

        // [구역 2] 엔티티 픽셀 사이즈 (Unit Dimensions)
        this.entity = {
            mercenary: {
                baseSize: 64,
                scale: 1.0,
                bodyRadius: 20 // 히트박스 반경
            },
            monster: {
                baseSize: 64,
                scale: 1.0,
                bossScale: 4.0
            },
            pet: {
                dog: 0.45,
                wolf: 0.5,
                owl: 0.4
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
