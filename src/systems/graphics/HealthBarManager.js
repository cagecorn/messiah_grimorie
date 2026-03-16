import Logger from '../../utils/Logger.js';
import canvasOffscreenManager from '../../ui/CanvasOffscreenManager.js';
import poolingManager from '../../core/PoolingManager.js';
import layerManager from '../../ui/LayerManager.js';
import { STAT_KEYS } from '../../core/EntityConstants.js';
import iconManager from '../IconManager.js';

/**
 * HP바 매니저 (HealthBar Manager)
 * 역할: [고해상도 개별 HP바 렌더링 및 풀링]
 * 
 * 특징:
 * 1. Offscreen Rendering: 2배 해상도로 캔버스에 그린 후 텍스처로 사용
 * 2. Dirty Flag: HP 수치 변화가 있을 때만 다시 그리기 (CPU 절약)
 * 3. Retro-Premium: 다크 실버 테두리 + 루비 레드 그라데이션 + 하이라이트 글래스 효과
 * 4. Pooling: 씬 이동이나 유닛 사망 시 객체 재사용
 * 5. Status Icons: 버프/디버프 아이콘 자동 정렬 및 겹침 표시 [NEW]
 */
class HealthBar {
    constructor(scene) {
        this.scene = scene;
        this.width = 60;  // 최종 표시 너비
        this.height = 16; // [상향] 4단 바(HP, Stamina, Skill, Ult) 구성을 위해 높이 조절
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
        
        // [신규] 상태 아이콘 컨테이너
        this.iconContainer = scene.add.container(0, -18); // 바 위쪽에 배치
        this.container.add(this.iconContainer);
        this.activeIcons = [];

        this.container.setVisible(false);
        this.container.setDepth(layerManager.getDepth('world_ui')); // 레이어 매니저 표준 깊이 적용

        // 상태 관리
        this.targetEntity = null;
        this.lastHp = -1;
        this.lastMaxHp = -1;
        this.lastSkillProgress = -1;
        this.lastUltimateProgress = -1;
        this.lastStaminaProgress = -1; // [신규] 스태미나 캐싱용
        this.lastShield = -1; // [신규] 쉴드 캐싱용
        this.lastStatusKey = ""; // [신규] 상태 이상 캐싱용
        
        // [신규] 진동(Shake) 효과 상태
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        
        this.isDirty = true;
    }

    /**
     * HP바 진동 효과 시작
     */
    shake(intensity = 4, duration = 200) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
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
    updatePosition(delta = 0) {
        if (!this.targetEntity || !this.targetEntity.active) return;
        
        // 진동 타이머 업데이트
        if (this.shakeTimer > 0) {
            this.shakeTimer -= delta;
        }

        // 애니메이션 중인 경우 스프라이트의 시각적 오프셋을 반영합니다.
        const vx = this.targetEntity.sprite ? this.targetEntity.sprite.x : 0;
        const vy = this.targetEntity.sprite ? this.targetEntity.sprite.y : 0;
        
        // 유닛의 중심 기준에서 머리 위(-75px)로 배치
        let posX = this.targetEntity.x + vx;
        let posY = this.targetEntity.y + vy - 75;

        // [신규] 진동 효과 적용 (고성능 오프셋 방식)
        if (this.shakeTimer > 0) {
            posX += (Math.random() - 0.5) * this.shakeIntensity;
            posY += (Math.random() - 0.5) * this.shakeIntensity;
        }

        this.container.setPosition(posX, posY);
    }

    /**
     * 내부 렌더링 (Dirty Flag일 때만 실행)
     */
    draw() {
        if (!this.isDirty || !this.targetEntity) return;

        // [상태 아이콘 업데이트 체크]
        this.updateStatusIcons();

        const hp = this.targetEntity.logic.stats.get(STAT_KEYS.HP);
        const maxHp = this.targetEntity.logic.stats.get(STAT_KEYS.MAX_HP);
        
        const skillProgress = this.targetEntity.skillProgress || 0;
        const ultimateProgress = this.targetEntity.ultimateProgress || 0;
        const staminaProgress = this.targetEntity.staminaProgress || 0;
        const shield = this.targetEntity.logic.shield || 0;
        const hasSkill = this.targetEntity.hasSkill;
        const hasUltimate = this.targetEntity.hasUltimate;

        // 최적화: 수치 변화가 없으면 렌더링 건너뜀
        if (hp === this.lastHp && maxHp === this.lastMaxHp && 
            skillProgress === this.lastSkillProgress && 
            ultimateProgress === this.lastUltimateProgress &&
            staminaProgress === this.lastStaminaProgress &&
            shield === this.lastShield &&
            this.lastStatusKey === this.getCurrentStatusKey()) {
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
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, w, h);
        
        const innerGap = 1.5 * this.resolution;
        const hpBarHeight = (hasSkill || hasUltimate) ? (h * 0.55) : (h - innerGap * 2);

        // 3. HP 배경 및 게이지
        ctx.fillStyle = '#2a0000';
        ctx.fillRect(innerGap, innerGap, w - innerGap * 2, hpBarHeight);

        if (hpRatio > 0) {
            const gaugeWidth = (w - innerGap * 2) * hpRatio;
            const grad = ctx.createLinearGradient(0, innerGap, 0, hpBarHeight);
            grad.addColorStop(0, '#ff4d4d');
            grad.addColorStop(0.5, '#b30000');
            grad.addColorStop(1, '#660000');
            
            ctx.fillStyle = grad;
            ctx.fillRect(innerGap, innerGap, gaugeWidth, hpBarHeight);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(innerGap, innerGap, gaugeWidth, hpBarHeight * 0.4);
        }

        // [신규] 쉴드 게이지 (HP바 위에 겹쳐서 표시하여 가시성 확보)
        if (shield > 0) {
            const shieldRatio = Math.min(1.0, shield / maxHp);
            // 쉴드가 너무 적어도 최소 15%는 보이게 하여 가시성 확보
            const minShieldWidth = (w - innerGap * 2) * 0.15;
            const shieldWidth = Math.max(minShieldWidth, (w - innerGap * 2) * shieldRatio);
            
            const shieldHeight = hpBarHeight * 0.7;
            const shieldY = innerGap;
            
            const shieldGrad = ctx.createLinearGradient(0, shieldY, 0, shieldY + shieldHeight);
            shieldGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); // 더 밝게
            shieldGrad.addColorStop(0.5, 'rgba(255, 223, 0, 0.6)'); // 골드
            shieldGrad.addColorStop(1, 'rgba(184, 134, 11, 0.4)');
            
            ctx.fillStyle = shieldGrad;
            ctx.shadowBlur = 8 * this.resolution;
            ctx.shadowColor = 'rgba(255, 215, 0, 1.0)'; // 글로우 강화
            ctx.fillRect(innerGap, shieldY, shieldWidth, shieldHeight);
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)'; // 실선 강화
            ctx.lineWidth = 1 * this.resolution;
            ctx.strokeRect(innerGap, shieldY, shieldWidth, shieldHeight);
            
            ctx.shadowBlur = 0;
        }

        // 4. [구역] 서브 바 설정 (Stamina, Skill, Ultimate)
        let currentY = innerGap + hpBarHeight + 1 * this.resolution;
        const subBarCount = 1 + (hasSkill ? 1 : 0) + (hasUltimate ? 1 : 0);
        const subBarHeight = (h - hpBarHeight - innerGap * 2 - (subBarCount * this.resolution)) / subBarCount;

        // 5. 스태미나 게이지 (시안색 / Cyan)
        // [USER 요청] 모든 유닛에게 스태미나 바 표시
        ctx.fillStyle = '#082f49'; // Very dark cyan background
        ctx.fillRect(innerGap, currentY, w - innerGap * 2, subBarHeight);

        if (staminaProgress > 0) {
            const stamWidth = (w - innerGap * 2) * Math.min(1, staminaProgress);
            const stamGrad = ctx.createLinearGradient(0, currentY, 0, currentY + subBarHeight);
            stamGrad.addColorStop(0, '#22d3ee'); // Bright cyan
            stamGrad.addColorStop(1, '#0891b2'); // Deep cyan
            ctx.fillStyle = stamGrad;
            ctx.fillRect(innerGap, currentY, stamWidth, subBarHeight);
        }
        currentY += subBarHeight + 1 * this.resolution;

        // 6. 스킬 게이지 (보라색)
        if (hasSkill) {
            ctx.fillStyle = '#0f0f1b';
            ctx.fillRect(innerGap, currentY, w - innerGap * 2, subBarHeight);

            if (skillProgress > 0) {
                const skillWidth = (w - innerGap * 2) * Math.min(1, skillProgress);
                const skillGrad = ctx.createLinearGradient(0, currentY, 0, currentY + subBarHeight);
                skillGrad.addColorStop(0, '#c084fc');
                skillGrad.addColorStop(1, '#7e22ce');
                ctx.fillStyle = skillGrad;
                ctx.fillRect(innerGap, currentY, skillWidth, subBarHeight);
            }
            currentY += subBarHeight + 1 * this.resolution;
        }

        // 6. 궁극기 게이지
        if (hasUltimate) {
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(innerGap, currentY, w - innerGap * 2, subBarHeight);

            if (ultimateProgress > 0) {
                const ultWidth = (w - innerGap * 2) * Math.min(1, ultimateProgress);
                const ultGrad = ctx.createLinearGradient(0, currentY, 0, currentY + subBarHeight);
                ultGrad.addColorStop(0, '#fbbf24');
                ultGrad.addColorStop(0.5, '#4f46e5');
                ultGrad.addColorStop(1, '#312e81');
                
                ctx.fillStyle = ultGrad;
                ctx.fillRect(innerGap, currentY, ultWidth, subBarHeight);
                
                if (ultimateProgress >= 1.0) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.fillRect(innerGap, currentY, ultWidth, subBarHeight * 0.3);
                }
            }
        }

        // 텍스처 업데이트
        this.texture.refresh();
        
        this.lastHp = hp;
        this.lastMaxHp = maxHp;
        this.lastSkillProgress = skillProgress;
        this.lastUltimateProgress = ultimateProgress;
        this.lastStaminaProgress = staminaProgress;
        this.lastShield = shield;
        this.isDirty = false;
    }

    /**
     * 현재 활성화된 모든 상태(CC + 버프 + 쉴드)의 고유 키 생성
     */
    getCurrentStatusKey() {
        if (!this.targetEntity) return "";
        const statusIds = this.targetEntity.status.getActiveEffectIds();
        const buffIds = (this.targetEntity.logic && this.targetEntity.logic.buffs) ? this.targetEntity.logic.buffs.getActiveBuffIds() : [];
        const hasShield = (this.targetEntity.logic && this.targetEntity.logic.shields && this.targetEntity.logic.shields.getTotalShield() > 0);
        
        const activeIds = [...new Set([...statusIds.map(id => id === 'stealthed' ? 'stealth' : id), ...buffIds])];
        if (hasShield) activeIds.push('shield');
        
        return activeIds.sort().join('|');
    }

    /**
     * [신규] 상태 아이콘 업데이트 (Dirty Flag & Pooling)
     */
    updateStatusIcons() {
        if (!this.targetEntity || !this.targetEntity.status) return;

        const statusKey = this.getCurrentStatusKey();

        // 상태가 변경되었을 때만 갱신
        if (this.lastStatusKey === statusKey) return;
        this.lastStatusKey = statusKey;

        // 기존 아이콘 해제
        this.activeIcons.forEach(icon => {
            icon.setVisible(false);
            poolingManager.release('status_icon', icon);
        });
        this.activeIcons = [];

        if (!statusKey) return;
        const activeIds = statusKey.split('|');

        // 아이콘 배치 설정
        const iconSize = 14;
        const maxTotalWidth = 50; // HP바 근처로 제한
        let spacing = 16;

        // 아이콘이 많으면 겹침 발생 (Overlap)
        if (activeIds.length * spacing > maxTotalWidth) {
            spacing = maxTotalWidth / activeIds.length;
        }

        const startX = -((activeIds.length - 1) * spacing) / 2;

        activeIds.forEach((id, index) => {
            const icon = poolingManager.get('status_icon');
            const textureKey = iconManager.getStatusKey(id);
            
            icon.setTexture(this.scene.textures.exists(textureKey) ? textureKey : 'unknown'); 
            
            icon.setDisplaySize(iconSize, iconSize);
            icon.setPosition(startX + index * spacing, 0);
            icon.setVisible(true);
            
            this.iconContainer.add(icon);
            this.activeIcons.push(icon);
        });
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
        this.lastShield = -1;
        this.lastStatusKey = "";
        
        // 아이콘들 해제
        this.activeIcons.forEach(icon => {
            icon.setVisible(false);
            poolingManager.release('status_icon', icon);
        });
        this.activeIcons = [];
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
        
        // [SCENE-SPECIFIC] 씬이 바뀔 때마다 팩토리 함수가 최신 씬을 참조하도록 풀 재등록
        // HP바 풀 등록
        poolingManager.registerPool('hp_bar', () => new HealthBar(this.scene), 20, true);
        
        // [신규] 상태 아이콘 풀 등록
        poolingManager.registerPool('status_icon', () => {
            const img = this.scene.add.image(0, 0, 'unknown');
            return img;
        }, 50, true);
        
        Logger.system("HealthBarManager: Re-linked to new scene instance & Pools updated.");
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
    update(delta) {
        this.activeBars.forEach(bar => {
            bar.updatePosition(delta);
            bar.draw();
        });
    }
}

const healthBarManager = new HealthBarManager();
export default healthBarManager;
