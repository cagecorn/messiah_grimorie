import Phaser from 'phaser';

/**
 * 전역 이벤트 버스 (Global Event Bus)
 * 모든 모듈 간의 통신을 담당합니다.
 */
const EventBus = new Phaser.Events.EventEmitter();

export default EventBus;

// 표준 이벤트 명칭 정의
export const EVENTS = {
    GAME_READY: 'GAME_READY',
    SCENE_CHANGED: 'SCENE_CHANGED',
    FOCUS_MODE_CHANGED: 'FOCUS_MODE_CHANGED',
    LANGUAGE_CHANGED: 'LANGUAGE_CHANGED',
    SAVE_DATA: 'SAVE_DATA',
    LOAD_DATA: 'LOAD_DATA',
    TRANSITION_START: 'TRANSITION_START',
    TRANSITION_COMPLETE: 'TRANSITION_COMPLETE',
    CHARACTER_INFO_OPEN: 'CHARACTER_INFO_OPEN',
    CHARACTER_INFO_CLOSE: 'CHARACTER_INFO_CLOSE',
    COMBAT_DATA: 'COMBAT_DATA',
    ENTITY_DIED: 'ENTITY_DIED'
};
