import Logger from '../utils/Logger.js';

/**
 * 카메라 매니저 (Camera Manager)
 * 역할: [라우터 (Router) & 좌표 동기화기]
 * 
 * 설명: Phaser의 다중 카메라 시스템과 DOM 요소 간의 좌표 연동을 총괄하는 라우터입니다.
 * 줌인/줌아웃 시에도 Canvas 상의 위치와 DOM UI의 위치가 어긋나지 않도록 계산 로직을 제공합니다.
 */
class CameraManager {
    constructor() {
        this.mainCamera = null;
        this.cameras = new Map(); // 다중 카메라 관리용
        
        Logger.system("CameraManager Router: Initialized (Multi-camera & DOM sync ready).");
    }

    /**
     * 메인 카메라 등록
     */
    setMainCamera(camera) {
        this.mainCamera = camera;
        this.cameras.set('main', camera);
        Logger.info("CAMERA_SYSTEM", "Main camera registered.");
    }

    /**
     * 특정 카메라 추가 (다중 카메라 시스템)
     */
    addCamera(id, camera) {
        this.cameras.set(id, camera);
        Logger.info("CAMERA_SYSTEM", `Additional camera registered: ${id}`);
    }

    /**
     * [핵심] Canvas 좌표 -> DOM 좌표 변환
     * 줌(Zoom)과 스크롤(Scroll)을 계산하여 DOM 요소가 월드 객체를 정확히 따라가게 합니다.
     * @param {number} x 월드 x 좌표
     * @param {number} y 월드 y 좌표
     * @param {string} cameraId 기본값 'main'
     */
    worldToDOM(x, y, cameraId = 'main') {
        const cam = this.cameras.get(cameraId);
        if (!cam) return { x: 0, y: 0 };

        // 1. 카메라의 줌과 스크롤을 반영한 화면 좌표 계산
        // (Phaser 내부 메서드인 worldToScreen 유사 로직)
        const screenX = (x - cam.scrollX) * cam.zoom;
        const screenY = (y - cam.scrollY) * cam.zoom;

        // 2. 캔버스 오프셋 반영 (필요 시)
        // 현재는 꽉 찬 화면(RESIZE)이므로 캔버스 자체가 0,0에서 시작한다고 가정
        return {
            x: screenX,
            y: screenY,
            zoom: cam.zoom // DOM 요소도 줌에 맞춰 스케일을 조절해야 할 수 있음
        };
    }

    /**
     * [핵심] DOM 좌표 -> Canvas 좌표 변환 (월드 좌표 찾기)
     */
    domToWorld(x, y, cameraId = 'main') {
        const cam = this.cameras.get(cameraId);
        if (!cam) return { x: 0, y: 0 };

        return {
            x: (x / cam.zoom) + cam.scrollX,
            y: (y / cam.zoom) + cam.scrollY
        };
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
