import Phaser from 'phaser';
import LayerManager from '../LayerManager.js';
import HealthBarPainter from './HealthBarPainter.js';

/**
 * 개별 헬스바 객체 (HealthBar Object)
 * 역할: [개별 유닛의 HUD 상태 관리 및 오프스크린 캔버스 유지]
 */
class HealthBar {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.barSprite = null;
        this.offscreenCanvas = null;
        this.ctx = null;
        this.entity = null;

        // [최적화] 이전 값 캐싱 (Dirty Flag 체크용)
        this.lastHP = -1;
        this.lastMaxHP = -1;
        this.lastShield = -1;
        this.lastStaminaProgress = -1;
        this.lastSkillProgress = -1;
        this.lastUltProgress = -1;
        this.lastIsMonster = null;

        // HUD 설정
        this.resolution = 2; // 선명한 UI를 위한 해상도 배율
        this.width = 100;
        this.height = 24; // HP(8) + 스태미나(4) + 스킬(4) + 궁극기(4) + 여백
        this.padding = 4;

        this.setupOffscreen();
    }

    /**
     * 오프스크린 캔버스 초기화
     */
    setupOffscreen() {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.width * this.resolution;
        this.offscreenCanvas.height = this.height * this.resolution;
        this.ctx = this.offscreenCanvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
    }

    /**
     * 엔티티에 HUD 연결
     */
    show(entity) {
        this.entity = entity;
        this.active = true;

        if (!this.barSprite) {
            this.barSprite = this.scene.add.sprite(0, 0, '');
            this.barSprite.setOrigin(0.5, 1);
            this.barSprite.setDepth(LayerManager.DEPTH.UI);
        }

        this.barSprite.setVisible(true);
        this.barSprite.setAlpha(1);
        
        // 초기 렌더링 강제 실행
        this.lastHP = -1;
        this.forceRedraw();
    }

    /**
     * HUD 해제 및 풀링 반환 준비
     */
    hide() {
        this.active = false;
        this.entity = null;
        if (this.barSprite) {
            this.barSprite.setVisible(false);
        }
    }

    /**
     * 매 프레임 업데이트
     */
    update() {
        if (!this.active || !this.entity || !this.entity.active) {
            this.hide();
            return;
        }

        // 1. 위치 동기화 (유닛 머리 위)
        const baseY = this.entity.y - (this.entity.zHeight || 0);
        this.barSprite.setPosition(this.entity.x, baseY - 5);

        // 2. 데이터 변화 감지 및 리드로우
        if (this.isDirty()) {
            this.draw();
        }
    }

    /**
     * 값이 변했는지 확인 (캐싱 전략)
     */
    isDirty() {
        const combat = this.entity.combat;
        const stats = this.entity.stats;

        // 스태미나 정보
        const stamina = this.entity.stamina;
        const currentStam = stamina ? stamina.currentStamina : 0;
        const maxStam = stamina ? stamina.maxStamina : 100;
        const stamProgress = currentStam / maxStam;

        const isDirty = 
            this.lastHP !== combat.currentHp ||
            this.lastMaxHP !== stats.maxHp ||
            this.lastShield !== combat.shield ||
            this.lastStaminaProgress !== stamProgress ||
            this.lastSkillProgress !== stats.skillProgress ||
            this.lastUltProgress !== stats.ultimateProgress ||
            this.lastIsMonster !== this.entity.isMonster;

        if (isDirty) {
            this.lastHP = combat.currentHp;
            this.lastMaxHP = stats.maxHp;
            this.lastShield = combat.shield;
            this.lastStaminaProgress = stamProgress;
            this.lastSkillProgress = stats.skillProgress;
            this.lastUltProgress = stats.ultimateProgress;
            this.lastIsMonster = this.entity.isMonster;
        }

        return isDirty;
    }

    forceRedraw() {
        this.draw();
    }

    /**
     * 실제 그리기 로직 (Painter 모듈로 위임)
     */
    draw() {
        const ctx = this.ctx;
        const res = this.resolution;
        const w = this.width * res;
        const h = this.height * res;
        
        const combat = this.entity.combat;
        const stats = this.entity.stats;
        const isMonster = this.entity.isMonster;

        // 1. 프레임 초기화
        HealthBarPainter.drawFrame(ctx, w, h, res);

        // 2. HP 바 (메인)
        const hpRatio = combat.currentHp / stats.maxHp;
        const shieldRatio = combat.shield / stats.maxHp;
        HealthBarPainter.drawHPBar(ctx, 2*res, 2*res, (this.width-4)*res, 8*res, hpRatio, shieldRatio, res);

        let currentY = 11 * res;

        // 3. 스태미나 바 (몬스터 제외)
        if (!isMonster) {
            HealthBarPainter.drawSubBar(ctx, 2*res, currentY, (this.width-4)*res, 3*res, this.lastStaminaProgress, 'stamina', res);
            currentY += 4 * res;
        }

        // 4. 스킬 바
        HealthBarPainter.drawSubBar(ctx, 2*res, currentY, (this.width-4)*res, 3*res, stats.skillProgress, 'skill', res);
        currentY += 4 * res;

        // 5. 궁극기 바 (몬스터 제외)
        if (!isMonster) {
            HealthBarPainter.drawSubBar(ctx, 2*res, currentY, (this.width-4)*res, 3*res, stats.ultimateProgress, 'ultimate', res);
        }

        // 6. 결과물을 스프라이트 텍스처로 반영
        const key = `hp_bar_${this.entity.id}_${Math.random()}`; // 유니크 키 생성 회피를 위해 updateTexture 호출
        this.scene.textures.addCanvas(key, this.offscreenCanvas);
        this.barSprite.setTexture(key);

        // 이전 텍스처 제거 (메모리 릭 방지)
        if (this.lastTextureKey && this.scene.textures.exists(this.lastTextureKey)) {
            this.scene.textures.remove(this.lastTextureKey);
        }
        this.lastTextureKey = key;
    }

    destroy() {
        if (this.barSprite) this.barSprite.destroy();
        if (this.lastTextureKey && this.scene.textures.exists(this.lastTextureKey)) {
            this.scene.textures.remove(this.lastTextureKey);
        }
    }
}

export default HealthBar;
