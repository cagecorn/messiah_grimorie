import Logger from '../utils/Logger.js';
import assetPathManager from '../core/AssetPathManager.js';

/**
 * 궁극기 컷씬 매니저 (Ultimate Cutscene Manager)
 * 역할: [궁극기 시전 시 DOM 기반의 고퀄리티 컷씬 연출 제어]
 */
class UltimateCutsceneManager {
    constructor() {
        this.container = null;
        this.isInitialized = false;
    }

    /**
     * 초기화: 레이어 컨테이너 생성 및 CSS 주입
     */
    init() {
        if (this.isInitialized) return;

        // 1. 컨테이너 생성
        this.container = document.createElement('div');
        this.container.id = 'ultimate-cutscene-layer';
        this.container.className = 'ult-cutscene-container';
        document.getElementById('game-container').appendChild(this.container);

        // 2. CSS 자동 주입 (별도 파일 로드 대신 동적 생성 가능하지만, 여기서는 인덱스 관리를 위해)
        this.isInitialized = true;
        Logger.system("UltimateCutsceneManager: DOM layer ready.");
    }

    /**
     * 컷씬 실행
     * @param {string} mercId 용병 아이디 (aren, etc.)
     * @param {string} skillName 시전하는 스킬 이름
     */
    show(mercId, skillName) {
        if (!this.isInitialized) this.init();

        // 에셋 경로 가져오기
        const portraitUrl = assetPathManager.getMercenaryPath(mercId, 'cutscene');
        if (!portraitUrl) return;

        // 기존 컷씬 청소
        this.container.innerHTML = '';

        // 1. 배경 슬래시 생성
        const slash = document.createElement('div');
        slash.className = 'ult-cutscene-bg-slash';
        this.container.appendChild(slash);

        // 2. 캐릭터 일러스트 생성
        const portrait = document.createElement('img');
        portrait.src = portraitUrl;
        portrait.className = 'ult-cutscene-portrait';
        this.container.appendChild(portrait);

        // 3. 네임플레이트 생성
        const nameplate = document.createElement('div');
        nameplate.className = 'ult-cutscene-nameplate';
        nameplate.textContent = skillName;
        this.container.appendChild(nameplate);

        // 애니메이션 시작 (타임아웃으로 약간의 시간차 부여)
        requestAnimationFrame(() => {
            slash.classList.add('active');
            portrait.classList.add('active');

            setTimeout(() => {
                nameplate.classList.add('active');
            }, 200);
        });

        // 자동 퇴장 (2초 후)
        setTimeout(() => {
            this.hide(portrait, nameplate, slash);
        }, 2200);

        Logger.info("CUTSCENE", `Ultimate Cutscene triggered for ${mercId}: ${skillName}`);
    }

    /**
     * 컷씬 종료 애니메이션 및 정리
     */
    hide(portrait, nameplate, slash) {
        portrait.classList.add('exit');
        nameplate.classList.add('exit');
        slash.style.opacity = '0';

        setTimeout(() => {
            if (this.container.contains(portrait)) portrait.remove();
            if (this.container.contains(nameplate)) nameplate.remove();
            if (this.container.contains(slash)) slash.remove();
        }, 1000);
    }
}

const ultimateCutsceneManager = new UltimateCutsceneManager();
export default ultimateCutsceneManager;
