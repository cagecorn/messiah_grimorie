import Logger from '../utils/Logger.js';
import EventBus, { EVENTS } from '../core/EventBus.js';
import domManager from './DOMManager.js';
import localizationManager from '../core/LocalizationManager.js';
import characterInfoManager from '../systems/CharacterInfoManager.js';
import mercenaryManager from '../systems/entities/MercenaryManager.js';
import monsterManager from '../systems/entities/MonsterManager.js';
import skillManager from '../systems/combat/SkillManager.js';
import ultimateManager from '../systems/combat/UltimateManager.js';
import damageCalculationManager from '../systems/combat/DamageCalculationManager.js';
import characterStatusManager from '../systems/CharacterStatusManager.js';
import iconManager from '../systems/IconManager.js';
import statusDescriptionManager from '../systems/StatusDescriptionManager.js';
import toastMessageManager from './ToastMessageManager.js';
import { ENTITY_CLASSES, CLASS_GROWTH, SPECIAL_GROWTH, STAT_KEYS } from '../core/EntityConstants.js';

/**
 * 캐릭터 인포 DOM 매니저 (Character Info DOM Manager)
 * 역할: [정보창 UI 렌더링 및 인터랙션 제어]
 * 
 * 설명: [더티 플래그]를 사용하여 데이터 변경 시에만 UI를 갱신합니다.
 * 탭 시스템을 통해 다양한 정보를 효율적으로 보여줍니다.
 */
class CharacterInfoDOMManager {
    constructor() {
        this.container = null;
        this.activeTab = 'stats';
        this.isDirty = false;
        this.updateTimer = null; // [신규] 실시간 동기화용 타이머
        
        this.setupListeners();
    }

    setupListeners() {
        console.log("[CharacterInfoDOMManager] Setting up global listeners...");
        EventBus.on(EVENTS.CHARACTER_INFO_OPEN, () => {
            console.log("[CharacterInfoDOMManager] Event CHARACTER_INFO_OPEN received!");
            this.show();
        });

        EventBus.on(EVENTS.CHARACTER_INFO_CLOSE, () => {
            this.hide();
        });
    }

    show() {
        console.log(`[CharacterInfoDOMManager] show() called. Target: ${characterInfoManager.currentTarget?.name}`);
        if (!this.container) {
            this.createUI();
        }
        this.container.style.display = 'flex';
        this.container.style.pointerEvents = 'auto'; // [필수] 레이어가 none이라 여기서 명시
        this.activeTab = 'stats'; // 초기 탭
        this.isDirty = true;
        this.update();
        
        // [신규] 전투 소스인 경우 실시간 업데이트 루프 시작
        if (characterInfoManager.source === 'combat') {
            this.startUpdateLoop();
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
        this.stopUpdateLoop(); // [신규] 루프 중지
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.className = 'character-info-overlay';
        
        const card = document.createElement('div');
        card.className = 'character-info-card';
        card.onclick = (e) => e.stopPropagation(); // 배경 클릭 닫기 보호
        this.container.onclick = () => characterInfoManager.clearTarget();

        this.container.appendChild(card);
        domManager.addToLayer('overlay', this.container);
        
        // 초기 뼈대만 생성, 내용은 update()에서 처리
        this.card = card;
    }

    /**
     * 전체 UI 갱신 (Dirty Flag 기반)
     */
    update() {
        if (!this.isDirty || !this.container) return;
        
        const target = characterInfoManager.currentTarget;
        if (!target) return;

        const id = characterInfoManager.getId();
        const logic = target.logic || {};
        const type = logic.type || 'unknown';
        
        let registryData = {};
        let className = type.toUpperCase();
        let portraitSrc = '';

        if (type === 'mercenary') {
            registryData = mercenaryManager.registry[id] || {};
            className = registryData.className || 'Unknown';
        } else if (type === 'monster') {
            registryData = monsterManager.registry[id] || {};
            className = 'MONSTER';
        }

        portraitSrc = iconManager.getEntityPortraitPath(id, type);

        // 초상화 폴백: 만약 위 로직에서 unknown이 떴거나 에셋을 못 찾은 경우
        // target.spriteKey를 기반으로 다시 질의합니다.
        if ((!portraitSrc || portraitSrc.includes('unknown.png')) && target.spriteKey) {
            const cleanKey = target.spriteKey.split('_')[0].split('.')[0];
            const fallbackPath = assetPathManager.getUniversalEntityPath(cleanKey, type, 'sprite');
            if (fallbackPath) portraitSrc = fallbackPath;
        }
        
        // 최종 점검: 상대경로 보정
        if (portraitSrc && portraitSrc.startsWith('/')) {
            portraitSrc = portraitSrc.substring(1);
        }

        // [USER RULE #4] 중요한 패치(엔티티 ID 해상도 수정) 결과 로그 출력
        console.log(`[PATCH] CharacterInfo portrait resolved for ${id} (${type}): ${portraitSrc}`);

        const name = characterInfoManager.getName();
        const level = logic.leveling?.getLevel() || target.level || 1;

        this.card.innerHTML = `
            <div class="info-header">
                <div class="info-title-group">
                    <span class="info-name">${name}</span>
                    <div class="info-subtitle">
                        <span>${className.toUpperCase()}</span>
                        <span>LV. ${level}</span>
                    </div>
                </div>
                <button class="close-btn" onclick="UI_CHARACTER_INFO_CLOSE()">×</button>
            </div>
            <div class="info-body">
                <div class="info-portrait-side">
                    <img src="${portraitSrc}" class="info-portrait-img" style="object-fit: contain;">
                </div>
                <div class="info-content-side">
                    <div class="info-tabs">
                        ${this.renderTabButton('stats', '📊', 'ui_info_tab_stats')}
                        ${this.renderTabButton('skills', '💫', 'ui_info_tab_skills')}
                        ${this.renderTabButton('equip', '⚔️', 'ui_info_tab_equip')}
                        ${this.renderTabButton('perks', '⭐', 'ui_info_tab_perks')}
                        ${this.renderTabButton('narrative', '📚', 'ui_info_tab_narrative')}
                        ${this.renderTabButton('dps', '📈', 'ui_info_tab_dps')}
                    </div>
                    <div class="info-tab-content">
                        ${this.renderTabContent()}
                    </div>
                </div>
            </div>
            ${this.renderStatusIcons()}
        `;

        // 전역 함수 등록 (HTML onclick 용)
        window.UI_CHARACTER_INFO_CLOSE = () => {
            console.log("[CharacterInfoDOMManager] Global Close called");
            characterInfoManager.clearTarget();
        };
        window.UI_CHARACTER_INFO_TAB = (tab) => this.switchTab(tab);
        window.UI_SHOW_STATUS_TOAST = (id, fullId) => {
            const target = characterInfoManager.currentTarget;
            if (!target) return;
            const report = characterStatusManager.getStatusReport(target);
            const iconData = report.activeIcons.find(i => i.fullId === fullId || i.id === id);
            
            if (iconData) {
                const title = statusDescriptionManager.getTitle(id);
                const desc = statusDescriptionManager.getDescription(id, iconData);
                toastMessageManager.show(`[${title}] ${desc}`, 'info');
            }
        };

        this.isDirty = false;
        
        // 마지막 렌더링 시점의 데이터 상태 저장 (최적화용) - 얕은 복사
        this.lastReportHash = this.generateReportHash(target);
    }

    renderTabButton(id, icon, labelKey) {
        const isActive = this.activeTab === id;
        return `
            <div class="info-tab ${isActive ? 'active' : ''}" onclick="UI_CHARACTER_INFO_TAB('${id}')">
                <span class="info-tab-icon">${icon}</span>
                <span class="info-tab-label">${localizationManager.t(labelKey)}</span>
            </div>
        `;
    }

    switchTab(tab) {
        this.activeTab = tab;
        this.isDirty = true;
        this.update();
    }

    renderTabContent() {
        switch (this.activeTab) {
            case 'stats': return this.renderStats();
            case 'skills': return this.renderSkills();
            case 'narrative': return this.renderNarrative();
            case 'dps': return this.renderDPS();
            case 'equip': return `<div class="info-no-data">${localizationManager.t('ui_info_no_equip')}</div>`;
            case 'perks': return `<div class="info-no-data">${localizationManager.t('ui_info_no_perks')}</div>`;
            default: return '';
        }
    }

    renderStats() {
        const target = characterInfoManager.currentTarget;
        const id = characterInfoManager.getId();
        const registryData = mercenaryManager.registry[id] || {};
        const level = target.logic?.leveling?.getLevel() || target.level || 1;
        
        // 클래스별 성장 가중치 가져오기
        const growth = registryData.isSpecial ? SPECIAL_GROWTH.PALADIN_TYPE : (CLASS_GROWTH[registryData.className] || {});

        // 1. 전투 중인 엔티티의 실시간 스탯 우선 (target.stats.get() 존재 시)
        // 2. 미보유/편성창 데이터인 경우 레지스트리의 baseStats + 성장치 사용
        const stats = target.stats || { 
            get: (key) => {
                const baseVal = registryData.baseStats ? registryData.baseStats[key] : 0;
                const weight = growth[key] || 0;
                const growthVal = weight * (level - 1);
                return (baseVal + growthVal) || 0;
            }
        };

        const list = [
            { key: STAT_KEYS.MAX_HP, label: 'ui_info_stat_hp' },
            { key: STAT_KEYS.ATK, label: 'ui_info_stat_atk' },
            { key: STAT_KEYS.M_ATK, label: 'ui_info_stat_matk' },
            { key: STAT_KEYS.DEF, label: 'ui_info_stat_def' },
            { key: STAT_KEYS.M_DEF, label: 'ui_info_stat_mdef' },
            { key: STAT_KEYS.SPEED, label: 'ui_info_stat_speed' },
            { key: STAT_KEYS.ATK_SPD, label: 'ui_info_stat_atkspd' },
            { key: STAT_KEYS.CRIT, label: 'ui_info_stat_crit' }
        ];

        // 성별 표시 대신 실시간 스탯 표시 (전투 중인 경우)
        const report = characterInfoManager.source === 'combat' ? characterStatusManager.getStatusReport(target) : null;
        const currentStats = report ? report.finalStats : null;

        return `
            <div class="stats-grid">
                ${list.map(s => {
                    const finalVal = currentStats ? currentStats[s.key] : stats.get(s.key);
                    const baseVal = stats.get(s.key);
                    const isBuffed = currentStats && Math.floor(finalVal) > Math.floor(baseVal);
                    const isDebuffed = currentStats && Math.floor(finalVal) < Math.floor(baseVal);
                    
                    // HP인 경우 특별 처리 (현재 HP / 최대 HP [+ 쉴드])
                    const displayVal = (s.key === STAT_KEYS.MAX_HP && currentStats) 
                        ? `${Math.floor(currentStats.hp)} / ${Math.floor(finalVal)}${currentStats.shield > 0 ? ` (+${Math.floor(currentStats.shield)})` : ''}`
                        : this.formatStatValue(s.key, finalVal);

                    return `
                        <div class="stat-row">
                            <span class="stat-label">${localizationManager.t(s.label)}</span>
                            <span class="stat-value ${isBuffed ? 'buffed' : ''} ${isDebuffed ? 'debuffed' : ''}">
                                ${displayVal}
                            </span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    formatStatValue(key, val) {
        if (key === 'crit' || key === 'atkSpd') return val.toFixed(2);
        return Math.floor(val);
    }

    renderSkills() {
        const id = characterInfoManager.getId();
        const skill = skillManager.getSkillData(id);
        const ult = ultimateManager.getUltimateData(id);

        let html = '';
        if (skill.hasSkill) {
            const sName = localizationManager.t(skill.nameKey) || skill.name;
            const sDesc = localizationManager.t(skill.descriptionKey) || skill.description;
            
            const hasScaling = skill.scalingStat && skill.scalingStat !== false;
            const badgeClass = skill.scalingStat === 'atk' ? 'scaling-atk' : 'scaling-matk';
            const badgeText = hasScaling ? localizationManager.t(skill.scalingStat === 'atk' ? 'ui_info_scaling_atk' : 'ui_info_scaling_matk') : '';

            html += `
                <div class="skill-item">
                    <div class="skill-header">
                        <span class="skill-name">${sName}</span>
                        ${hasScaling ? `<span class="scaling-badge ${badgeClass}">${badgeText}</span>` : ''}
                    </div>
                    <div class="skill-desc">${sDesc}</div>
                </div>
            `;
        }
        if (ult.hasUltimate) {
            const uName = localizationManager.t(ult.nameKey) || ult.name;
            const uDesc = localizationManager.t(ult.descriptionKey) || ult.description;
            
            const hasScaling = ult.scalingStat && ult.scalingStat !== false;
            const badgeClass = ult.scalingStat === 'atk' ? 'scaling-atk' : 'scaling-matk';
            const badgeText = hasScaling ? localizationManager.t(ult.scalingStat === 'atk' ? 'ui_info_scaling_atk' : 'ui_info_scaling_matk') : '';

            html += `
                <div class="skill-item">
                    <div class="skill-header">
                        <span class="skill-name" style="color: var(--mg-gold)">${uName} (ULTIMATE)</span>
                        ${hasScaling ? `<span class="scaling-badge ${badgeClass}">${badgeText}</span>` : ''}
                    </div>
                    <div class="skill-desc">${uDesc}</div>
                </div>
            `;
        }
        return html || `<div class="info-no-data">${localizationManager.t('ui_info_no_data')}</div>`;
    }

    renderNarrative() {
        const id = characterInfoManager.getId();
        return `<div class="narrative-text">${localizationManager.t(`merc_${id}_desc`)}</div>`;
    }

    renderDPS() {
        const target = characterInfoManager.currentTarget;
        if (characterInfoManager.source !== 'combat' || !target.logic) {
            return `<div class="info-no-data">DPS tracking only available during battle.</div>`;
        }
        
        const dps = damageCalculationManager.calculateDPS(target.logic.id);
        const stats = damageCalculationManager.getStats(target.logic.id);

        return `
            <div class="dps-meter">
                <div class="dps-value">${Math.floor(dps)}</div>
                <div class="dps-label">REAL-TIME DPS</div>
                <div style="margin-top: 20px; text-align: left; font-size: 13px; color: rgba(255,255,255,0.5);">
                    <div>Total Dealt: ${Math.floor(stats.dealt)}</div>
                    <div>Total Received: ${Math.floor(stats.received)}</div>
                    <div>Total Healed: ${Math.floor(stats.healed)}</div>
                </div>
            </div>
        `;
    }

    /**
     * [신규] 상태 아이콘 영역 렌더링
     */
    renderStatusIcons() {
        const target = characterInfoManager.currentTarget;
        if (characterInfoManager.source !== 'combat' || !target || !target.logic) return '';

        const report = characterStatusManager.getStatusReport(target);
        if (!report || report.activeIcons.length === 0) return '';

        return `
            <div class="info-status-icons">
                ${report.activeIcons.map(icon => `
                    <div class="status-icon-wrapper ${icon.type}" 
                         style="cursor: pointer;" 
                         onclick="UI_SHOW_STATUS_TOAST('${icon.id}', '${icon.fullId || ''}')">
                        <img src="${icon.iconPath}" title="${icon.id}">
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * [신규] 실시간 업데이트 루프
     */
    startUpdateLoop() {
        this.stopUpdateLoop();
        this.updateTimer = setInterval(() => {
            if (this.container && this.container.style.display === 'flex') {
                const target = characterInfoManager.currentTarget;
                if (!target) return;

                // [최적화] 데이터가 변했을 때만 Dirty 설정
                const newHash = this.generateReportHash(target);
                if (newHash !== this.lastReportHash) {
                    this.isDirty = true;
                    this.update();
                }
            } else {
                this.stopUpdateLoop();
            }
        }, 200); // 0.2초마다 갱신
    }

    /**
     * 데이터 변경 감지용 간이 해시 생성
     */
    generateReportHash(target) {
        if (!target || !target.logic) return '';
        const report = characterStatusManager.getStatusReport(target);
        if (!report) return '';

        // 주요 변동 수치들만 조합하여 문자열 생성 (쉴드 추가)
        const s = report.finalStats;
        const iconIds = report.activeIcons.map(i => i.id).join(',');
        return `${report.hp}/${report.maxHp}/${s.shield}/${s.atk}/${s.mAtk}/${s.def}/${s.mDef}/${s.speed}/${s.atkSpd}/${s.crit}/${iconIds}/${this.activeTab}`;
    }

    stopUpdateLoop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
}

const characterInfoDOMManager = new CharacterInfoDOMManager();
export default characterInfoDOMManager;
