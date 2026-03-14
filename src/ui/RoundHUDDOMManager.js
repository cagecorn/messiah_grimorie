import domManager from './DOMManager.js';
import EventBus from '../core/EventBus.js';
import state from '../core/GlobalState.js';

/**
 * 라운드 표시 DOM 매니저 (Round Display DOM Manager)
 * 역할: [전투 중 현재 라운드 시각화]
 */
class RoundHUDDOMManager {
    constructor() {
        this.container = null;
        this.roundValue = null;
    }

    initialize() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'hud-round-display';
        this.container.className = 'mg-round-display';
        
        // 초기 HTML 구성
        this.container.innerHTML = `
            <div class="round-label">ROUND</div>
            <div class="round-number">1</div>
        `;

        this.roundValue = this.container.querySelector('.round-number');

        // 레이어 매니저를 통해 UI 레이어에 추가 (z-index 1000)
        domManager.addToLayer('ui', this.container);

        // 이벤트 리스너 등록
        EventBus.on('ROUND_STARTED', (data) => this.updateRound(data.round));
        EventBus.on('UI_ENTER_BATTLE', () => this.show());
        EventBus.on('UI_OPEN_TERRITORY', () => this.hide());
        
        this.hide(); // 초기에는 숨김
    }

    updateRound(round) {
        if (this.roundValue) {
            this.roundValue.innerText = round;
            // 애니메이션 효과 (스케일 업/다운 등)
            this.roundValue.classList.remove('pulse');
            void this.roundValue.offsetWidth; // 리플로우 강제
            this.roundValue.classList.add('pulse');
        }
    }

    show() {
        if (this.container) this.container.style.display = 'flex';
    }

    hide() {
        if (this.container) this.container.style.display = 'none';
    }
}

const roundHUDDOMManager = new RoundHUDDOMManager();
export default roundHUDDOMManager;
