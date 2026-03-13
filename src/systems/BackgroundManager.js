import EventBus, { EVENTS } from '../core/EventBus.js';
import Logger from '../utils/Logger.js';
import measurementManager from '../core/MeasurementManager.js';

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
     * @param {Object} options { depth, fixedScale }
     */
    setBackground(scene, textureKey, options = {}) {
        const { depth = -100, fixedScale = null } = options;
        
        // [CLEANUP] 이전 배경이 있다면 제거
        this.clearBackground();

        this.currentScene = scene;
        this.currentKey = textureKey;
        this.fixedScale = fixedScale;

        const center = { x: scene.cameras.main.centerX, y: scene.cameras.main.centerY };
        
        // 새로운 배경 생성 (스크롤 팩터 설정을 위해 중앙에 배치)
        this.currentBG = scene.add.image(0, 0, textureKey);
        this.currentBG.setOrigin(0, 0); // 0,0 기반으로 배치
        this.currentBG.setDepth(depth);
        
        // 전투 씬인 경우 스크롤 팩터를 1로 (카메라 이동 시 함께 이동)
        // 일반 UI 씬인 경우 0으로 (화면 고정)
        const isBattle = scene.scene.key === 'BattleScene';
        this.currentBG.setScrollFactor(isBattle ? 1 : 0);

        // 스케일 조정
        this.updateScale();

        Logger.info("BACKGROUND", `Background set: ${textureKey} in ${scene.scene.key} (Scale: ${fixedScale || 'Auto-Cover'})`);

        // 리사이즈 이벤트 연결
        scene.scale.off('resize', this.updateScale, this);
        scene.scale.on('resize', this.updateScale, this);
    }

    /**
     * 화면 크기 또는 고정값에 맞춰 현재 배경 스케일링
     */
    updateScale() {
        if (!this.currentBG || !this.currentScene) return;

        if (this.fixedScale) {
            this.currentBG.setScale(this.fixedScale);
            return;
        }

        // 기본 Cover 방식 (UI 씬 등에서 사용)
        const { width, height } = this.currentScene.scale;
        const scaleX = width / this.currentBG.width;
        const scaleY = height / this.currentBG.height;
        const scale = Math.max(scaleX, scaleY);
        
        this.currentBG.setScale(scale);
        this.currentBG.setPosition(0, 0); // setOrigin(0,0) 이므로
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
