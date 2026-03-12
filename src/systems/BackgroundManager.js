import EventBus, { EVENTS } from '../core/EventBus.js';
import Logger from '../utils/Logger.js';

/**
 * 배경 매니저 (Background Manager)
 * 역할: [전역 배경 이미지 관리 및 최적화]
 * 
 * 설명: 여러 씬에서 공통적으로 사용하거나 전환되는 배경 이미지를 중앙에서 제어합니다.
 * 씬 전환 시 이전 배경의 잔상을 완벽히 제거하고, 화면 크기에 맞게 자동으로 스케일링합니다.
 */
class BackgroundManager {
    constructor() {
        this.currentScene = null;
        this.currentBG = null;
        this.currentKey = null;
        Logger.system("BackgroundManager: Initialized.");
    }

    /**
     * 특정 씬에 배경 이미지 설정
     * @param {Phaser.Scene} scene 
     * @param {string} textureKey 
     * @param {number} depth 
     */
    setBackground(scene, textureKey, depth = -100) {
        // [CLEANUP] 이전 배경이 있다면 제거
        this.clearBackground();

        this.currentScene = scene;
        this.currentKey = textureKey;

        const center = { x: scene.cameras.main.centerX, y: scene.cameras.main.centerY };
        
        // 새로운 배경 생성
        this.currentBG = scene.add.image(center.x, center.y, textureKey);
        this.currentBG.setOrigin(0.5);
        this.currentBG.setDepth(depth);
        this.currentBG.setScrollFactor(0); // 카메라 이동에 영향받지 않음

        // 스케일 조정 (Cover 방식)
        this.updateScale();

        Logger.info("BACKGROUND", `Background set: ${textureKey} in ${scene.scene.key}`);

        // 리사이즈 이벤트 연결
        scene.scale.off('resize', this.updateScale, this);
        scene.scale.on('resize', this.updateScale, this);
    }

    /**
     * 화면 크기에 맞춰 현재 배경 스케일링
     */
    updateScale() {
        if (!this.currentBG || !this.currentScene) return;

        const { width, height } = this.currentScene.scale;
        const scaleX = width / this.currentBG.width;
        const scaleY = height / this.currentBG.height;
        const scale = Math.max(scaleX, scaleY);
        
        this.currentBG.setScale(scale);
        this.currentBG.setPosition(width / 2, height / 2);
    }

    /**
     * 현재 배경 제거
     */
    clearBackground() {
        if (this.currentBG) {
            Logger.info("BACKGROUND", `Clearing previous background: ${this.currentKey}`);
            this.currentBG.destroy();
            this.currentBG = null;
        }
        this.currentKey = null;
    }
}

const backgroundManager = new BackgroundManager();
export default backgroundManager;
