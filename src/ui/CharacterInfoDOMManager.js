import Logger from '../utils/Logger.js';
import EventBus, { EVENTS } from '../core/EventBus.js';
import domManager from './DOMManager.js';
import localizationManager from '../core/LocalizationManager.js';
import characterInfoManager from '../systems/CharacterInfoManager.js';
import mercenaryManager from '../systems/entities/MercenaryManager.js';
import skillManager from '../systems/combat/SkillManager.js';
import ultimateManager from '../systems/combat/UltimateManager.js';
import damageCalculationManager from '../systems/combat/DamageCalculationManager.js';
import iconManager from '../systems/IconManager.js';
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
        
        this.setupListeners();
    }

    setupListeners() {
        EventBus.on('UI_OPEN_CHARACTER_INFO', () => {
            this.show();
        });

        EventBus.on('UI_CLOSE_CHARACTER_INFO', () => {
            this.hide();
        });
    }

    show() {
        if (!this.container) {
            this.createUI();
        }
        this.container.style.display = 'flex';
        this.activeTab = 'stats'; // 초기 탭
        this.isDirty = true;
        this.update();
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
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
        const registryData = mercenaryManager.registry[id] || {};
        const name = characterInfoManager.getName();
        const level = target.logic?.leveling?.getLevel() || target.level || 1;
        const className = registryData.className || 'Unknown';

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
                    <img src="${iconManager.getPortraitPath(id)}" class="info-portrait-img">
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
        `;

        // 닫기 버튼 전역 바인딩 (간결함 위해)
        window.UI_CHARACTER_INFO_CLOSE = () => characterInfoManager.clearTarget();
        window.UI_CHARACTER_INFO_TAB = (tab) => this.switchTab(tab);

        this.isDirty = false;
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

        return `
            <div class="stats-grid">
                ${list.map(s => `
                    <div class="stat-row">
                        <span class="stat-label">${localizationManager.t(s.label)}</span>
                        <span class="stat-value">${this.formatStatValue(s.key, stats.get(s.key))}</span>
                    </div>
                `).join('')}
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
}

const characterInfoDOMManager = new CharacterInfoDOMManager();
export default characterInfoDOMManager;
