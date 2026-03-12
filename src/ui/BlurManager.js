import Logger from '../utils/Logger.js';

/**
 * 블러 매니저 (Blur Manager)
 * 역할: [라우터 (Router) & 시각적 효과 통제관]
 * 
 * 설명: 게임 내 모든 블러(Blur) 효과를 중앙에서 관리합니다.
 * UI 배경의 가우시안 블러, 포스트 프로세싱 효과, 특정 영역 강조를 위한 블러 처리를 지원합니다.
 */
class BlurManager {
    constructor() {
        this.targets = new Map();
        
        // 블러 강도 사전 정의 (Standard Intensity)
        this.presets = {
            none: 0,
            low: 4,
            medium: 8,
            high: 16,
            ultra: 32
        };

        Logger.system("BlurManager Router: Initialized (Visual blur processing ready).");
    }

    /**
     * 블러 효과 적용 대상 등록 (Phaser 객체 혹은 DOM ID)
     */
    registerTarget(id, element, type = 'canvas') {
        this.targets.set(id, { element, type });
        Logger.info("BLUR_ROUTER", `Registered blur target: ${id} (${type})`);
    }

    /**
     * 블러 효과 라우팅
     * @param {string} targetId 등록된 타겟 ID
     * @param {string|number} intensity 프리셋 이름 또는 직접 지정값
     */
    applyBlur(targetId, intensity) {
        const target = this.targets.get(targetId);
        if (!target) {
            Logger.warn("BLUR_ROUTER", `Target not found for blur: ${targetId}`);
            return;
        }

        const value = typeof intensity === 'string' ? (this.presets[intensity] || 0) : intensity;

        if (target.type === 'dom') {
            this.applyDOMBlur(target.element, value);
        } else {
            this.applyCanvasBlur(target.element, value);
        }

        Logger.info("BLUR_ROUTER", `Applied blur to ${targetId}: intensity ${value}`);
    }

    /**
     * DOM 요소에 블러 적용 (CSS Filter)
     */
    applyDOMBlur(element, value) {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (el) {
            el.style.filter = value > 0 ? `blur(${value}px)` : 'none';
            el.style.transition = 'filter 0.3s ease'; // 부드러운 전환 효과 기본 적용
        }
    }

    /**
     * Phaser(Canvas) 객체에 블러 적용 (FX Pipeline)
     */
    applyCanvasBlur(element, value) {
        // Phaser 3.60+ FX Pipeline 연동
        if (element && element.postFX) {
            if (value > 0) {
                // 기존 블러 제거 후 새로 적용 (중복 방지)
                element.postFX.clear();
                element.postFX.addBlur(value);
            } else {
                element.postFX.clear();
            }
        }
    }

    /**
     * 모든 블러 효과 초기화
     */
    clearAll() {
        this.targets.forEach((target, id) => {
            this.applyBlur(id, 0);
        });
        Logger.info("BLUR_ROUTER", "All blur effects cleared.");
    }
}

const blurManager = new BlurManager();
export default blurManager;
