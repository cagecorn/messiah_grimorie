import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import backgroundManager from '../systems/BackgroundManager.js';

/**
 * 편성 씬 (Formation Scene)
 * 역할: [부대 배치 및 전략 수립]
 */
export default class FormationScene extends Phaser.Scene {
    constructor() {
        super('FormationScene');
    }

    preload() {
        // [디자인 요구사항] 멋진 배경 로드 (필요시 임시 배경 사용)
        // 일단 영지 배경과 차별화된 어두운 배경이 있다면 좋겠지만, 
        // 현재는 배경 없이 검은색이나 그라디언트로 처리될 수도 있음.
        Logger.info("SCENE", "FormationScene: Preloading...");
    }

    create() {
        Logger.info("SCENE", "FormationScene: Initialized.");
        
        // 배경을 검은색이나 어두운 톤으로 설정 (CSS가 주력이므로 단순하게)
        this.cameras.main.setBackgroundColor('#050505');
        
        // [시각적 모듈화] 편성 전용 DOM UI는 UIManager/FormationDOMManager가 담당
        // SceneManager가 이 씬으로 전환하면 자동으로 EVENTS.SCENE_CHANGED가 발생하여 UI가 열림
    }
}
