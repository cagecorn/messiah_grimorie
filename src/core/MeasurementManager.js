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
            bgScale: 1.5 // 1536x1024 배경을 1.5배 스케일링하여 2304x1536 월드 커버
        };

        // [구역 2] 엔티티 크기 및 정보 (Entity Sizes)
        this.entity = {
            mercenary: {
                scale: 0.5,        // 128px -> 64px (High-Res 대응)
                bodyRadius: 20
            },
            monster: {
                scale: 0.5,        // 128px -> 64px (용병과 1:1 비율)
                bossScale: 1.0,    // 보스는 128px 크기로 출력 (1.0배)
                bodyRadius: 25
            },
            pet: {
                default: 0.25      // 128px -> 32px
            },
            summon: {
                scale: 0.5,        // 128px -> 64px
                bodyRadius: 20
            }
        };

        // [구역 3] UI 및 폰트 사이즈
        this.ui = {
            fontSizeTitle: '48px',
            fontSizeNormal: '24px',
            fontSizeSmall: '16px',
            padding: 20
        };

        // [구역 4] 카메라 설정 (Camera Settings)
        this.camera = {
            lerp: 0.05,
            zoomLerp: 0.02,
            minZoom: 0.5,
            maxZoom: 2.0,          // High-Res 이므로 줌아웃/줌인 폭 확대
            spreadPadding: 1.5,
            minSpread: 400
        };

        // [구역 5] 그림자 및 고도 설정 (Shadow & Elevation)
        this.graphics = {
            shadow: {
                baseWidth: 50,
                baseHeight: 18,
                baseAlpha: 0.6,
                color: 0x000000,
                offsetX: 0,            // 좌우 치우침 보정용
                offsetY: -10,          // [FIX] 이미지 하단 여백 보정 (그림자를 위로 띄움)
                scaleAtMaxHeight: 0.3, 
                alphaAtMaxHeight: 0.0, 
                maxEffectHeight: 400   
            }
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
