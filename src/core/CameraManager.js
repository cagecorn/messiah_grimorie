import Logger from '../utils/Logger.js';
import coordinateManager from '../systems/combat/CoordinateManager.js';
import measurementManager from '../core/MeasurementManager.js';

/**
 * 카메라 매니저 (Camera Manager)
 * 역할: [라우터 (Router) & 좌표 동기화기]
 */
class CameraManager {
    constructor() {
        this.mainCamera = null;
        this.cameras = new Map();
        
        Logger.system("CameraManager: Initialized.");
    }
// ... [existing methods setMainCamera, addCamera, worldToDOM, domToWorld remain same] ...
    setMainCamera(camera) {
        this.mainCamera = camera;
        this.cameras.set('main', camera);
    }

    addCamera(id, camera) {
        this.cameras.set(id, camera);
    }

    worldToDOM(x, y, cameraId = 'main') {
        const cam = this.cameras.get(cameraId);
        if (!cam) return { x: 0, y: 0 };
        const screenX = (x - cam.scrollX) * cam.zoom;
        const screenY = (y - cam.scrollY) * cam.zoom;
        return { x: screenX, y: screenY, zoom: cam.zoom };
    }

    domToWorld(x, y, cameraId = 'main') {
        const cam = this.cameras.get(cameraId);
        if (!cam) return { x: 0, y: 0 };
        return {
            x: (x / cam.zoom) + cam.scrollX,
            y: (y / cam.zoom) + cam.scrollY
        };
    }

    /**
     * [신규] 아군 군집 추적 및 자동 줌 업데이트
     */
    updateFollowAllies(scene, allies, delta) {
        if (!this.mainCamera || !allies || allies.length === 0) return;

        // 1. 아군 중앙 위치 및 확산 정도 계산 (CoordinateManager 활용)
        const bounds = coordinateManager.getGroupBounds(allies);
        
        // 유닛이 한 명이라도 있으면 트래킹 진행 (spread가 0이어도 중심 좌표는 존재)
        if (allies.length > 0 && isNaN(bounds.centerX)) return; 

        const config = measurementManager.camera;
        const centerX = bounds.centerX;
        const centerY = bounds.centerY;
        const maxSpread = Math.max(bounds.maxSpread || 0, config.minSpread);

        // 2. 부드러운 카메라 이동 (Lerp + centerOn)
        // Phaser 카메라의 midPoint는 현재 화면의 실제 월드 중심을 반환합니다 (줌 반영됨)
        const currentX = this.mainCamera.midPoint.x;
        const currentY = this.mainCamera.midPoint.y;

        // [DEBUG] 카메라 트레킹 로그
        if (allies.length > 0 && scene.time.now % 1000 < 20) {
            console.log(`[CAMERA] Target: (${centerX.toFixed(1)}, ${centerY.toFixed(1)}), Current: (${currentX.toFixed(1)}, ${currentY.toFixed(1)}), Zoom: ${this.mainCamera.zoom.toFixed(2)}`);
        }

        const nextX = Phaser.Math.Linear(currentX, centerX, config.lerp);
        const nextY = Phaser.Math.Linear(currentY, centerY, config.lerp);

        this.mainCamera.centerOn(nextX, nextY);

        // 3. 적응형 줌 계산
        const screenWidth = this.mainCamera.width;
        const screenHeight = this.mainCamera.height;
        const worldWidth = measurementManager.world.width;
        const worldHeight = measurementManager.world.height;

        // [신규] 맵 밖의 빈 공간(Void)이 보이지 않도록 최소 안전 줌 계산
        // 화면이 월드를 꽉 채울 수 있는 가장 작은 줌 레벨
        const minSafeZoom = Math.max(screenWidth / worldWidth, screenHeight / worldHeight);
        
        // 줌 레벨 계산 (spread가 0인 경우를 대비해 minSpread 사용)
        let targetZoom = Math.min(
            screenWidth / (maxSpread * config.spreadPadding), 
            screenHeight / (maxSpread * config.spreadPadding)
        );
        
        // 줌 범위 제한 (minSafeZoom을 하한선으로 강제 적용)
        targetZoom = Phaser.Math.Clamp(targetZoom, Math.max(config.minZoom, minSafeZoom), config.maxZoom);

        // 4. 부드러운 줌 전환
        const newZoom = Phaser.Math.Linear(this.mainCamera.zoom, targetZoom, config.zoomLerp);
        this.mainCamera.setZoom(newZoom);
    }

    /**
     * 전투 시작 시 카메라를 중앙 유폭 지역으로 즉시 이동
     */
    centerCamera() {
        if (!this.mainCamera) return;
        const config = measurementManager.camera;
        const worldWidth = measurementManager.world.width;
        const worldHeight = measurementManager.world.height;
        
        // 월드 중앙으로 즉시 배치
        this.mainCamera.centerOn(worldWidth / 2, worldHeight / 2);
        this.mainCamera.setZoom(config.maxZoom); // 초기엔 줌인 상태
        
        Logger.info("CAMERA", `Centered to: (${worldWidth / 2}, ${worldHeight / 2})`);
    }

    /**
     * 모든 카메라 줌 설정
     * @param {number} zoomVal 
     */
    setAllZoom(zoomVal) {
        this.cameras.forEach(cam => {
            cam.setZoom(zoomVal);
        });
        Logger.info("CAMERA_SYSTEM", `All cameras zoom set to: ${zoomVal}`);
    }
}

const cameraManager = new CameraManager();
export default cameraManager;
