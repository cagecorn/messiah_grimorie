import assetPathManager from '../core/AssetPathManager.js';

/**
 * 아이콘 매니저 (Icon Manager)
 * 역할: [아이콘 및 초상화 에셋 라우팅]
 * 
 * 설명: 모든 UI 요소에서 사용하는 아이콘(버프, 디버프, 초상화)의 경로를 반환합니다.
 * 하드코딩을 방지하고 중앙에서 관리합니다.
 */
class IconManager {
    constructor() {
        this.buffIcons = {
            'atk_up': 'atk_up',
            'def_up': 'def_up',
            'speed_up': 'speed_up',
            'stunned': 'stunned',
            'burned': 'burned',
            'knockback': 'knockback',
            'airborne': 'airborne',
            'invincible': 'invincible',
            'sleep': 'sleep_icon',
            'shield': 'shield_icon',
            'inspiration': 'inspiration_icon'
        };
        
        this.defaultIcon = '/assets/icon/unknown.png';
    }

    /**
     * 용병의 초상화 경로를 반환합니다.
     */
    getPortraitPath(mercId) {
        // 현재는 스프라이트 이미지를 초상화로 활용
        return assetPathManager.getMercenaryPath(mercId, 'sprite') || this.defaultIcon;
    }

    /**
     * 버프/디버프 아이콘 경로를 반환합니다.
     */
    getStatusIconPath(statusId) {
        return this.buffIcons[statusId] || `assets/icon/${statusId}.png`;
    }

    /**
     * 별 등급 아이콘 (또는 텍스트/이모지) 반환
     */
    getStarEmoji(grade) {
        return '★'.repeat(grade || 1);
    }
}

const iconManager = new IconManager();
export default iconManager;
