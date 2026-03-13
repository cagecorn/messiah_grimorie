import Logger from '../../utils/Logger.js';
import canvasOffscreenManager from '../../ui/CanvasOffscreenManager.js';
import poolingManager from '../../core/PoolingManager.js';
import layerManager from '../../ui/LayerManager.js';
import { STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * HP바 매니저 (HealthBar Manager)
 * 역할: [고해상도 개별 HP바 렌더링 및 풀링]
 * 
 * 특징:
 * 1. Offscreen Rendering: 2배 해상도로 캔버스에 그린 후 텍스처로 사용
 * 2. Dirty Flag: HP 수치 변화가 있을 때만 다시 그리기 (CPU 절약)
 * 3. Retro-Premium: 다크 실버 테두리 + 루비 레드 그라데이션 + 하이라이트 글래스 효과
 * 4. Pooling: 씬 이동이나 유닛 사망 시 객체 재사용
 */
class HealthBar {
    constructor(scene) {
        this.scene = scene;
        this.width = 60;  // 최종 표시 너비
        this.height = 10; // 최종 표시 높이
        this.resolution = 2; // 슈퍼 샘플링 배율
        
        // 오프스크린 버퍼 생성
        this.buffer = canvasOffscreenManager.createBuffer(this.width, this.height);
        this.canvas = this.buffer.canvas;
        this.ctx = this.buffer.ctx;

        // Phaser 텍스처 등록 (고유 ID 생성)
        this.textureKey = `hp_bar_${Math.random().toString(36).substr(2, 9)}`;
        this.texture = scene.textures.addCanvas(this.textureKey, this.canvas);
        
        // 스프라이트 객체 (유닛 머리 위에 붙을 것)
        this.container = scene.add.container(0, 0);
        this.sprite = scene.add.image(0, 0, this.textureKey);
        this.sprite.setScale(this.buffer.displayScale); // 2배 크기를 다시 절반으로 축소
        this.container.add(this.sprite);
        this.container.setVisible(false);
        this.container.setDepth(layerManager.getDepth('world_ui')); // 레이어 매니저 표준 깊이 적용

        // 상태 관리
        this.targetEntity = null;
        this.lastHp = -1;
        this.lastMaxHp = -1;
        this.lastSkillProgress = -1; // [신규] 스킬 진행도 캐싱
        this.isDirty = true;
    }

    /**
     * 특정 엔티티에 HP바 바인딩
     */
    bind(entity) {
        this.targetEntity = entity;
        this.isDirty = true;
        this.container.setVisible(true);
        this.updatePosition();
    }

    /**
     * 엔티티 위치 추적 (매 프레임 호출)
     */
    updatePosition() {
        if (!this.targetEntity || !this.targetEntity.active) return;
        
        // 애니메이션 중인 경우 스프라이트의 시각적 오프셋을 반영합니다.
        const vx = this.targetEntity.sprite ? this.targetEntity.sprite.x : 0;
        const vy = this.targetEntity.sprite ? this.targetEntity.sprite.y : 0;
        
        // 유닛의 중심 기준에서 머리 위(-75px)로 배치
        this.container.setPosition(this.targetEntity.x + vx, this.targetEntity.y + vy - 75);
    }

    /**
     * 내부 렌더링 (Dirty Flag일 때만 실행)
     */
    draw() {
        if (!this.isDirty || !this.targetEntity) return;

        const hp = this.targetEntity.logic.stats.get(STAT_KEYS.HP);
        const maxHp = this.targetEntity.logic.stats.get(STAT_KEYS.MAX_HP);
        
        // [신규] 스킬 진행도 확인
        const skillProgress = this.targetEntity.skillProgress || 0;
        const hasSkill = this.targetEntity.hasSkill;

        // 최적화: 수치 변화가 없으면 렌더링 건너뜀
        if (hp === this.lastHp && maxHp === this.lastMaxHp && skillProgress === this.lastSkillProgress) {
            this.isDirty = false;
            return;
        }

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const hpRatio = Math.max(0, Math.min(1, hp / maxHp));

        // 1. 클리어
        ctx.clearRect(0, 0, w, h);

        // 2. 바깥쪽 테두리 (Metallic Dark Silver)
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(0, 0, w, h);
        
        const innerGap = 2 * this.resolution;
        const hpBarHeight = hasSkill ? (h * 0.7) : (h - innerGap * 2);

        // 3. 배경 (더 어두운 레드)
        ctx.fillStyle = '#4a0000';
        ctx.fillRect(innerGap, innerGap, w - innerGap * 2, hpBarHeight);

        // 4. 메인 게이지 (Ruby Gradient)
        if (hpRatio > 0) {
            const gaugeWidth = (w - innerGap * 2) * hpRatio;
            const grad = ctx.createLinearGradient(0, innerGap, 0, hpBarHeight);
            grad.addColorStop(0, '#ff4d4d'); // 밝은 레드
            grad.addColorStop(0.5, '#b30000'); // 루비 레드
            grad.addColorStop(1, '#660000'); // 딥 레드
            
            ctx.fillStyle = grad;
            ctx.fillRect(innerGap, innerGap, gaugeWidth, hpBarHeight);

            // 5. 글래스 효과 (상단 하이라이트)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(innerGap, innerGap, gaugeWidth, hpBarHeight * 0.4);
        }

        // 6. [신규] 스킬 게이지 (시전 속도가 반영된 쿨타임 바)
        if (hasSkill) {
            const skillBarHeight = (h - hpBarHeight - innerGap * 2);
            const skillY = innerGap + hpBarHeight + 1 * this.resolution;
            
            // 스킬 배경 (어두운 보라/남색)
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(innerGap, skillY, w - innerGap * 2, skillBarHeight);

            if (skillProgress > 0) {
                const skillWidth = (w - innerGap * 2) * Math.min(1, skillProgress);
                const skillGrad = ctx.createLinearGradient(0, skillY, 0, skillY + skillBarHeight);
                skillGrad.addColorStop(0, '#a78bfa'); // 연보라
                skillGrad.addColorStop(1, '#6d28d9'); // 진보라
                
                ctx.fillStyle = skillGrad;
                ctx.fillRect(innerGap, skillY, skillWidth, skillBarHeight);
            }
        }

        // 7. 텍스처 슬롯 업데이트 (Phaser 전송)
        this.texture.refresh();
        
        this.lastHp = hp;
        this.lastMaxHp = maxHp;
        this.lastSkillProgress = skillProgress;
        this.isDirty = false;
    }

    onAcquire() {
        this.container.setVisible(true);
        this.isDirty = true;
    }

    onRelease() {
        this.container.setVisible(false);
        this.targetEntity = null;
        this.lastHp = -1;
        this.lastSkillProgress = -1;
    }

    destroy() {
        this.container.destroy();
        this.texture.destroy();
    }
}

class HealthBarManager {
    constructor() {
        this.activeBars = new Set();
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        
        // PoolingManager에 HP바 등록
        poolingManager.registerPool('hp_bar', () => new HealthBar(this.scene), 20);
        
        Logger.system("HealthBarManager: Super-sampling & Pooling initialized.");
    }

    /**
     * 유닛을 위한 HP바 요청
     */
    createBar(entity) {
        const bar = poolingManager.get('hp_bar');
        bar.bind(entity);
        this.activeBars.add(bar);
        return bar;
    }

    /**
     * HP바 반납
     */
    releaseBar(bar) {
        if (this.activeBars.has(bar)) {
            this.activeBars.delete(bar);
            poolingManager.release('hp_bar', bar);
        }
    }

    /**
     * 업데이트 루프 (위치 추적 및 그리기)
     */
    update() {
        this.activeBars.forEach(bar => {
            bar.updatePosition();
            bar.draw();
        });
    }
}

const healthBarManager = new HealthBarManager();
export default healthBarManager;
