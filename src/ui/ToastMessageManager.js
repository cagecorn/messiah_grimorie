import Logger from '../utils/Logger.js';
import LayerManager from './LayerManager.js';

/**
 * 토스트 메시지 매니저 (Toast Message Manager)
 * 역할: [최상위 알림 시스템]
 * 
 * 설명: 사용자에게 즉각적인 피드백을 주는 알림(Toast)을 관리합니다.
 * 이 매니저로 생성된 메시지는 [필수 조건: 항상 최상위 레이어]에 표시됩니다.
 */
class ToastMessageManager {
    constructor() {
        this.containerId = 'toast-container';
        this.topDepth = 99999; // LayerManager의 어떤 값보다도 높은 절대적 우선순위
        this.initialize();
    }

    initialize() {
        // DOM 컨테이너 생성 (항상 최상위에 오도록 스타일 설정)
        let container = document.getElementById(this.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.left = '50%';
            container.style.transform = 'translateX(-50%)';
            container.style.zIndex = this.topDepth.toString();
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.style.pointerEvents = 'none'; // 게임 클릭 방해 금지
            document.body.appendChild(container);
        }
        
        Logger.system("ToastMessageManager: Initialized (Top-layer guaranteed).");
    }

    /**
     * 토스트 메시지 출력
     * @param {string} message 표시할 내용
     * @param {string} type 'info' | 'warn' | 'error' | 'success'
     */
    show(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.dataset.antigravity = "toast";
        
        // 인라인 스타일 (CSS 파일 생성 전 기본 시각화)
        toast.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        toast.style.color = '#fff';
        toast.style.padding = '12px 24px';
        toast.style.marginBottom = '10px';
        toast.style.borderRadius = '4px';
        toast.style.borderLeft = this.getTypeColor(type);
        toast.style.fontSize = '16px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
        toast.style.animation = 'toastIn 0.3s ease-out';
        toast.innerText = message;

        const container = document.getElementById(this.containerId);
        container.appendChild(toast);

        Logger.info("SYSTEM_TOAST", `[${type}] ${message}`);

        // 3초 후 자동 제거
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    getTypeColor(type) {
        switch (type) {
            case 'error': return '5px solid #ff4d4d';
            case 'warn': return '5px solid #ffaa00';
            case 'success': return '5px solid #2ecc71';
            default: return '5px solid #00fbff';
        }
    }
}

const toastMessageManager = new ToastMessageManager();
export default toastMessageManager;
