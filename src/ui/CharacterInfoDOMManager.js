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
import statisticsManager from '../systems/StatisticsManager.js';
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

        // [신규] 워커로부터 통계 데이터 수집 완료 시 UI 갱신 부하 최소화하며 실행
        EventBus.on('STATS_UPDATED', (data) => {
            const target = characterInfoManager.currentTarget;
            if (target && target.logic && target.logic.id === data.id) {
                if (this.activeTab === 'dps') {
                    this.isDirty = true;
                    this.update();
                }
            }
        });
    }

    show() {
        console.log(`[CharacterInfoDOMManager] show() called. Target: ${characterInfoManager.getName()}`);
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
        
        // 카드 뼈대 생성
        this.container.innerHTML = `
            <div class="character-info-card">
                <div class="info-header">
                    <div class="info-title-group">
                        <span class="info-name" id="ci-name"></span>
                        <div class="info-subtitle">
                            <span id="ci-class"></span>
                            <span id="ci-level"></span>
                        </div>
                        <div class="info-exp-container">
                            <div class="info-exp-bar">
                                <div id="ci-exp-fill" class="info-exp-fill"></div>
                            </div>
                            <span id="ci-exp-text" class="info-exp-text"></span>
                        </div>
                    </div>
                    <button class="close-btn" onclick="UI_CHARACTER_INFO_CLOSE()">×</button>
                </div>
                <div class="info-body">
                    <div class="info-portrait-side">
                        <img id="ci-portrait" class="info-portrait-img" style="object-fit: contain;">
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
                        <div class="info-tab-content" id="ci-tab-content"></div>
                    </div>
                </div>
                <div id="ci-status-icons"></div>
            </div>
        `;

        this.card = this.container.querySelector('.character-info-card');
        this.els = {
            name: this.container.querySelector('#ci-name'),
            class: this.container.querySelector('#ci-class'),
            level: this.container.querySelector('#ci-level'),
            expFill: this.container.querySelector('#ci-exp-fill'),
            expText: this.container.querySelector('#ci-exp-text'),
            portrait: this.container.querySelector('#ci-portrait'),
            tabContent: this.container.querySelector('#ci-tab-content'),
            statusIcons: this.container.querySelector('#ci-status-icons'),
            tabs: Array.from(this.container.querySelectorAll('.info-tab'))
        };

        this.container.onclick = () => characterInfoManager.clearTarget();
        this.card.onclick = (e) => e.stopPropagation();

        domManager.addToLayer('overlay', this.container);

        // 전역 함수 등록
        window.UI_CHARACTER_INFO_CLOSE = () => characterInfoManager.clearTarget();
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
    }

    /**
     * [리전 수정] 부분 갱신 로직 (Granular Update)
     */
    update() {
        if (!this.container || !this.isDirty) return;
        
        const target = characterInfoManager.currentTarget;
        if (!target) return;

        const id = characterInfoManager.getId();
        const logic = target.logic || target; // [FIX] logic이 없으면 target 자체를 데이터 소스로 활용
        const type = logic.type || target.type || 'unknown';
        const newHash = this.generateReportHash(target);

        // 1. 타겟 변경 시에만 헤더/초상화 갱신
        if (this.lastTargetId !== id) {
            this.updateHeaderAndPortrait(target, id, type);
            this.lastTargetId = id;
            this.lastTab = null; // 탭 내용도 강제 갱신
        }

        // 2. 탭 전환 시에만 탭 내용 뼈대 갱신
        if (this.lastTab !== this.activeTab) {
            this.els.tabContent.innerHTML = this.renderTabContent();
            this.updateTabButtons();
            this.lastTab = this.activeTab;
        }

        // 3. 데이터 변경 시에만 세부 수치/그래프/아이콘 갱신
        if (newHash !== this.lastReportHash) {
            this.updateDynamicContent(target);
            this.lastReportHash = newHash;
        }

        this.isDirty = false;
    }

    updateHeaderAndPortrait(target, id, type) {
        const name = characterInfoManager.getName();
        const derivedType = characterInfoManager.getType(); // [NEW] 명시적 타입 추출
        const leveling = characterInfoManager.getLeveling();
        const level = leveling ? (leveling.getLevel ? leveling.getLevel() : (leveling.level || 1)) : (target.level || 1);
        
        let className = 'UNKNOWN';
        if (derivedType === 'mercenary') {
            const registryData = mercenaryManager.registry[id] || {};
            className = registryData.className || 'Unknown';
        } else if (derivedType === 'monster') {
            className = 'MONSTER';
        } else if (derivedType === 'summon') {
            className = 'SUMMON';
        }

        this.els.name.textContent = name;
        this.els.class.textContent = (localizationManager.t('ui_class_' + className.toLowerCase())).toUpperCase();
        this.els.level.textContent = `LV. ${level}`;

        // EXP 업데이트
        if (leveling) {
            const exp = Math.floor(leveling.exp || 0);
            const maxExp = Math.floor(leveling.maxExp || 100);
            const progress = (exp / maxExp) * 100;
            this.els.expFill.style.width = `${progress}%`;
            this.els.expText.textContent = `${exp} / ${maxExp} XP`;
        } else {
            this.els.expFill.style.width = '0%';
            this.els.expText.textContent = '';
        }

        let portraitSrc = iconManager.getEntityPortraitPath(id, derivedType);
        if ((!portraitSrc || portraitSrc.includes('unknown.png')) && target.spriteKey) {
            const cleanKey = target.spriteKey.split('_')[0].split('.')[0];
            const fallbackPath = assetPathManager.getUniversalEntityPath(cleanKey, derivedType, 'sprite');
            if (fallbackPath) portraitSrc = fallbackPath;
        }
        if (portraitSrc && portraitSrc.startsWith('/')) portraitSrc = portraitSrc.substring(1);

        this.els.portrait.src = portraitSrc;
    }

    updateTabButtons() {
        this.els.tabs.forEach(tab => {
            const tabId = tab.getAttribute('onclick').match(/'([^']+)'/)[1];
            if (tabId === this.activeTab) tab.classList.add('active');
            else tab.classList.remove('active');
        });
    }

    updateDynamicContent(target) {
        // 탭별 부분 업데이트
        if (this.activeTab === 'stats') {
            this.updateStatsValues(target);
        } else if (this.activeTab === 'dps') {
            this.updateDPSValues(target);
        }

        // 상태 아이콘은 전용 영역 갱신 (비교 로직 짜기엔 너무 잘 바뀌므로 덮어쓰기)
        this.els.statusIcons.innerHTML = this.renderStatusIcons();
    }

    updateStatsValues(target) {
        const report = characterStatusManager.getStatusReport(target);
        if (!report) return;

        const currentStats = report.finalStats;
        const statsLogic = target.stats; // CombatEntity.stats
        
        const list = [
            STAT_KEYS.MAX_HP, STAT_KEYS.ATK, STAT_KEYS.M_ATK, STAT_KEYS.DEF, 
            STAT_KEYS.M_DEF, STAT_KEYS.SPEED, STAT_KEYS.ATK_SPD, STAT_KEYS.CRIT
        ];

        list.forEach(key => {
            const el = this.els.tabContent.querySelector(`[data-stat="${key}"]`);
            if (!el) return;

            const finalVal = currentStats[key];
            const baseVal = statsLogic ? statsLogic.get(key) : finalVal;

            let displayVal = this.formatStatValue(key, finalVal);
            if (key === STAT_KEYS.MAX_HP) {
                displayVal = `${Math.floor(currentStats.hp)} / ${Math.floor(finalVal)}${currentStats.shield > 0 ? ` (+${Math.floor(currentStats.shield)})` : ''}`;
            }

            el.textContent = displayVal;
            el.classList.toggle('buffed', Math.floor(finalVal) > Math.floor(baseVal));
            el.classList.toggle('debuffed', Math.floor(finalVal) < Math.floor(baseVal));
        });
    }

    updateDPSValues(target) {
        const stats = statisticsManager.getCachedStats(target.logic.id);
        if (!stats) return;

        const dpsVal = this.els.tabContent.querySelector('.dps-value');
        if (dpsVal) dpsVal.textContent = Math.floor(stats.dps);

        // 기타 스탯 그리드 수치들
        const rows = this.els.tabContent.querySelectorAll('.dps-stat-row .value');
        if (rows.length >= 4) {
            rows[0].textContent = Math.floor(stats.totalDealt);
            rows[1].textContent = Math.floor(stats.totalReceived);
            rows[2].textContent = Math.floor(stats.totalHealed);
            rows[3].textContent = Math.floor(stats.totalMitigated);
        }

        // 그래프 그리기
        this.drawDPSGraph(stats);
    }

    renderTabButton(id, icon, labelKey) {
        return `
            <div class="info-tab" onclick="UI_CHARACTER_INFO_TAB('${id}')">
                <span class="info-tab-icon">${icon}</span>
                <span class="info-tab-label">${localizationManager.t(labelKey)}</span>
            </div>
        `;
    }

    switchTab(tab) {
        if (this.activeTab === tab) return;
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
                            <span class="stat-value ${isBuffed ? 'buffed' : ''} ${isDebuffed ? 'debuffed' : ''}" data-stat="${s.key}">
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
        
        const stats = statisticsManager.getCachedStats(target.logic.id) || {
            dps: 0, totalDealt: 0, totalReceived: 0, totalHealed: 0, totalMitigated: 0, dpsHistory: []
        };

        return `
            <div class="dps-meter">
                <div class="dps-value" id="dps-value-total">${Math.floor(stats.dps)}</div>
                <div class="dps-label">REAL-TIME DPS</div>
                
                <div class="dps-graph-container">
                    <canvas id="dps-graph-canvas" class="dps-canvas"></canvas>
                </div>

                <div class="dps-stats-grid">
                    <div class="dps-stat-row">
                        <span class="label">Total Dealt</span>
                        <span class="value dealt">${Math.floor(stats.totalDealt)}</span>
                    </div>
                    <div class="dps-stat-row">
                        <span class="label">Total Received</span>
                        <span class="value received">${Math.floor(stats.totalReceived)}</span>
                    </div>
                    <div class="dps-stat-row">
                        <span class="label">Total Healed</span>
                        <span class="value healed">${Math.floor(stats.totalHealed)}</span>
                    </div>
                    <div class="dps-stat-row">
                        <span class="label">Total Mitigated</span>
                        <span class="value mitigated">${Math.floor(stats.totalMitigated)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * [신규] DPS 히스토리 그래프 그리기 (Canvas)
     */
    drawDPSGraph(stats) {
        const canvas = document.getElementById('dps-graph-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const history = stats.dpsHistory || [];
        
        // 캔버스 크기 동기화
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;

        ctx.clearRect(0, 0, w, h);
        if (history.length < 2) return;

        // 최댓값 계산 (최소 100)
        const max = Math.max(100, ...history) * 1.2;

        ctx.beginPath();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ff4d4d';

        // 그림자/글로우 효과
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 77, 77, 0.5)';

        const points = history.map((val, i) => ({
            x: (i / 29) * w,
            y: h - (val / max) * h
        }));

        // 부드러운 곡선 그리기 (Catmull-Rom approximation)
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        ctx.stroke();

        // 영역 채우기 (그라데이션)
        ctx.shadowBlur = 0; // 채우기에는 그림자 제거
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(255, 77, 77, 0.2)');
        grad.addColorStop(1, 'rgba(255, 77, 77, 0)');
        
        ctx.lineTo(points[points.length - 1].x, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
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

                if (this.activeTab === 'dps') {
                    statisticsManager.requestUnitStats(target.logic.id);
                }

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

        // 주요 변동 수치들만 조합하여 문자열 생성 (쉴드 및 DPS 정보 추가)
        const s = report.finalStats;
        const iconIds = report.activeIcons.map(i => i.id).join(',');
        const dpsStats = statisticsManager.getCachedStats(target.logic.id) || {};
        const dpsHash = this.activeTab === 'dps' ? `${dpsStats.totalDealt}/${dpsStats.totalHealed}/${(dpsStats.dpsHistory || []).length}` : '';
        
        return `${report.hp}/${report.maxHp}/${s.shield}/${s.atk}/${s.mAtk}/${s.def}/${s.mDef}/${s.speed}/${s.atkSpd}/${s.crit}/${iconIds}/${this.activeTab}/${dpsHash}`;
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
