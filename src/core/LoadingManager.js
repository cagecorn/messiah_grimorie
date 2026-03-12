import Logger from '../utils/Logger.js';

/**
 * 로딩 매니저 (Loading Manager)
 * 역할: [라우터 & 자산 로드 조정자]
 * 
 * 설명: 모든 씬의 프리로드(Preload) 단계에서 자산 로딩 상태를 통합 관리합니다.
 * 로딩 바 시각화 명령을 HUD 또는 특정 씬으로 라우팅합니다.
 */
class LoadingManager {
    constructor() {
        this.progress = 0;
        Logger.system("LoadingManager: Initialized (Asset sync ready).");
    }

    /**
     * 로딩 시작 알림
     */
    onStart(scene) {
        Logger.info("LOADER", `Loading started in scene: ${scene.scene.key}`);
        this.progress = 0;
    }

    /**
     * 진행률 업데이트 라우팅
     */
    onProgress(value) {
        this.progress = value;
        // Logger.info("LOADER", `Progress: ${Math.floor(value * 100)}%`);
    }

    /**
     * 로딩 완료 알림
     */
    onComplete() {
        Logger.info("LOADER", "All assets loaded successfully.");
    }

    /**
     * 특정 에러 발생 시 라우팅
     */
    onError(file) {
        Logger.error("LOADER", `Failed to load asset: ${file.src}`);
    }
}

const loadingManager = new LoadingManager();
export default loadingManager;
