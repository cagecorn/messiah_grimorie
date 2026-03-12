import Logger from '../utils/Logger.js';

/**
 * 오디오 매니저 (Audio Manager)
 * 역할: [라우터 (Router) & 상태 보존기]
 * 
 * 설명: 게임 내 배경음악(BGM)과 효과음(SFX)을 통합 관리합니다.
 * 1. 새로운 BGM 재생 시 기존 BGM 자동 정지.
 * 2. 장면 전환 시 이전 장면의 BGM 재생 위치를 기억하여 복귀 시 끊긴 지점부터 재생.
 */
class AudioManager {
    constructor() {
        this.currentBGM = null;
        this.bgmRegistry = new Map(); // 각 장면별 BGM 인스턴스/위치 저장
        this.bgmPositions = new Map(); // 각 BGM 키별 재생 지점(seconds) 저장
        
        Logger.system("AudioManager Router: Initialized (BGM state persistence ready).");
    }

    /**
     * BGM 재생 라우팅
     * @param {Phaser.Scene} scene 현재 Phaser 씬
     * @param {string} key AssetPathManager에 등록된 오디오 키
     * @param {boolean} loop 반복 여부 (기본 true)
     */
    playBGM(scene, key, loop = true) {
        // 1. 이미 같은 BGM이 재생 중이라면 무시
        if (this.currentBGM && this.currentBGM.key === key && this.currentBGM.isPlaying) {
            return;
        }

        // 2. 현재 재생 중인 다른 BGM이 있다면 위치 기억 후 정지
        if (this.currentBGM && this.currentBGM.isPlaying) {
            this.bgmPositions.set(this.currentBGM.key, this.currentBGM.seek);
            this.currentBGM.stop();
            Logger.info("AUDIO_SYSTEM", `Paused BGM: ${this.currentBGM.key} at ${this.bgmPositions.get(this.currentBGM.key)}s`);
        }

        // 3. 새 BGM 재생 (이전 위치 기록이 있다면 거기서부터 시작)
        const startPosition = this.bgmPositions.get(key) || 0;
        
        // 씬의 사운드 매니저를 통해 사운드 객체 생성 또는 재사용
        let bgm = scene.sound.add(key, { loop });
        bgm.play();
        
        if (startPosition > 0) {
            bgm.seek = startPosition;
            Logger.info("AUDIO_SYSTEM", `Resumed BGM: ${key} from ${startPosition}s`);
        } else {
            Logger.info("AUDIO_SYSTEM", `Started New BGM: ${key}`);
        }

        this.currentBGM = bgm;
    }

    /**
     * 현재 BGM 정지 및 위치 저장
     */
    stopBGM() {
        if (this.currentBGM) {
            this.bgmPositions.set(this.currentBGM.key, this.currentBGM.seek);
            this.currentBGM.stop();
            Logger.info("AUDIO_SYSTEM", `Stopped BGM: ${this.currentBGM.key} (Position saved)`);
        }
    }

    /**
     * 효과음 재생 라우팅
     */
    playSFX(scene, key, volume = 1.0) {
        scene.sound.play(key, { volume });
    }

    /**
     * 전역 오디오 볼륨 설정 라우팅
     */
    setGlobalVolume(game, volume) {
        game.sound.volume = volume;
        Logger.info("AUDIO_SYSTEM", `Global volume set to: ${volume}`);
    }
}

const audioManager = new AudioManager();
export default audioManager;
