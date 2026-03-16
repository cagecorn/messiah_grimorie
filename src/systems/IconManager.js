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
            'atk_up': 'atk_up.png',
            'def_up': 'def_up.png',
            'speed_up': 'speed_up.png',
            'stunned': 'stunned.png',
            'burned': 'burned.png',
            'knockback': 'knockback.png',
            'airborne': 'airborne.png',
            'invincible': 'invincible.png',
            'sleep': 'sleep_icon.png',
            'shield': 'shield_icon.png',
            'inspiration': 'inspiration_icon.png',
            'stoneskin': 'stone_skin_icon.png'
        };
        
        this.defaultIcon = 'assets/icon/unknown.png';
    }

    /**
     * 엔티티의 초상화 경로를 반환합니다. (용병, 몬스터, 소환수 대응)
     */
    getEntityPortraitPath(id, type = 'mercenary') {
        return assetPathManager.getUniversalEntityPath(id, type, 'sprite') || this.defaultIcon;
    }

    /**
     * [Deprecated] 용병의 초상화 경로를 반환합니다. (getEntityPortraitPath 권장)
     */
    getPortraitPath(mercId) {
        return this.getEntityPortraitPath(mercId, 'mercenary');
    }

    /**
     * 버프/디버프 아이콘 경로를 반환합니다. (HTML 전용)
     */
    getStatusIconPath(statusId) {
        // [Mapping] 특정 ID들을 공용 아이콘으로 연결
        const mappedId = this.mapStatusId(statusId);
        return assetPathManager.getPath('images', mappedId) || this.defaultIcon;
    }

    /**
     * [Alias] getStatusIconPath
     */
    getStatusPath(statusId) {
        return this.getStatusIconPath(statusId);
    }

    /**
     * Phaser에서 사용하는 텍스처 키를 반환합니다. (Phaser 전용)
     */
    getStatusKey(statusId) {
        const mappedId = this.mapStatusId(statusId);
        if (assetPathManager.images[mappedId]) return mappedId;
        return 'unknown';
    }

    /**
     * 특정 상세 ID를 대표 아이콘 ID로 맵핑합니다.
     */
    mapStatusId(id) {
        if (!id) return 'unknown';
        const lowerId = id.toLowerCase();
        
        if (lowerId.includes('inspiration')) return 'inspiration';
        if (lowerId.includes('stoneskin')) return 'stoneskin';
        if (lowerId.includes('song_of_protection')) return 'shield';
        if (lowerId === 'stealth' || lowerId === 'stealthed') return 'stealth_icon';
        if (lowerId === 'gale') return 'gale_icon';
        if (lowerId === 'rapidfire' || lowerId === 'rapid_fire') return 'snapshot_icon';
        
        return lowerId;
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
