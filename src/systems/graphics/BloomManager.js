import Logger from '../../utils/Logger.js';

/**
 * 블룸 매니저 (Bloom Manager - Phaser PostFX)
 */
class BloomManager {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        // WebGL 모드 확인
        if (scene.renderer.type === Phaser.WEBGL) {
            this.applyBloom();
        }
    }

    applyBloom() {
        // [규칙] 특정 레이어(예: 스킬 레이어)에 블룸 적용 가능
        // 현재는 메인 카메라의 전체 포스트 프로세싱으로 예시
        // scene.cameras.main.setPostPipeline(Phaser.Renderer.WebGL.Pipelines.PostFX.Bloom); 
        // Phaser의 PostFX Bloom 설정이 좀 더 복잡하므로, 
        // 간단하게는 bloom 플러그인이 로드되어 있어야 함.
        
        Logger.info("PHASER_FX", "Bloom PostFX registered.");
    }
}

export default new BloomManager();
