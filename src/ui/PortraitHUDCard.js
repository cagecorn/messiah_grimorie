import Logger from '../utils/Logger.js';
import iconManager from '../systems/IconManager.js';
import characterInfoManager from '../systems/CharacterInfoManager.js';

/**
 * 초상화 허드 카드 (Portrait HUD Card)
 * 역할: [개별 용병 상태 표시 유닛]
 * 
 * 설명: 한 명의 용병에 대한 초상화, 이름, HP/게이지, 버프 상태를 HTML로 표현합니다.
 */
export default class PortraitHUDCard {
    constructor(mercData) {
        this.id = mercData.id;
        this.name = mercData.name;
        this.grade = mercData.grade || 1;
        this.level = mercData.level || 1;
        
        this.container = null;
        this.elements = {};
        this.isDirty = true;
        
        // 캐싱된 상태 값 (Dirty Flag용)
        this.lastState = {
            hpPercent: -1,
            skillPercent: -1,
            ultPercent: -1,
            buffs: []
        };
    }

    /**
     * 초기 HTML 구조 생성
     */
    create() {
        const card = document.createElement('div');
        card.className = 'mg-portrait-card';
        card.dataset.id = this.id;

        card.innerHTML = `
            <div class="mg-portrait-frame">
                <img src="${iconManager.getPortraitPath(this.id)}" class="mg-portrait-img">
            </div>
            <div class="mg-merc-info">
                <div class="mg-merc-header">
                    <div class="mg-merc-name-group">
                        <span class="mg-merc-name">${this.name.toUpperCase()}</span>
                        <span class="mg-merc-lvl">LV. ${this.level || 1}</span>
                    </div>
                    <span class="mg-merc-stars">${iconManager.getStarEmoji(this.grade)}</span>
                </div>
                <div class="mg-bars-container">
                    <div class="mg-bar-wrapper hp">
                        <div class="mg-bar-fill hp" style="width: 100%"></div>
                        <div class="mg-bar-ticks"></div>
                    </div>
                    <div class="mg-bar-wrapper skill">
                        <div class="mg-bar-fill skill" style="width: 0%"></div>
                    </div>
                    <div class="mg-ult-container">
                        <div class="mg-ult-bar-wrapper">
                            <div class="mg-ult-bar-fill" style="width: 0%"></div>
                        </div>
                        <span class="mg-ult-text">ULT 0%</span>
                    </div>
                </div>
                <div class="mg-buff-list"></div>
            </div>
        `;
        
        // [신규] 초상화 프레임 클릭 시 상세 정보창 열기
        const frame = card.querySelector('.mg-portrait-frame');
        frame.addEventListener('click', (e) => {
            e.stopPropagation();
            // 전투 중이므로 source: combat
            characterInfoManager.setTarget(this, 'combat');
        });

        this.container = card;
        
        // 캐싱 엘리먼트
        this.elements.hpFill = card.querySelector('.mg-bar-fill.hp');
        this.elements.skillFill = card.querySelector('.mg-bar-fill.skill');
        this.elements.ultFill = card.querySelector('.mg-ult-bar-fill');
        this.elements.ultText = card.querySelector('.mg-ult-text');
        this.elements.buffList = card.querySelector('.mg-buff-list');

        return card;
    }

    /**
     * 상태 업데이트 (Dirty Flag 기반 최적화)
     */
    update(data) {
        if (!this.container) return;

        // 1. HP 업데이트
        if (this.lastState.hpPercent !== data.hpPercent) {
            this.elements.hpFill.style.width = `${data.hpPercent}%`;
            this.lastState.hpPercent = data.hpPercent;
        }

        // 2. 스킬 게이지 업데이트
        if (this.lastState.skillPercent !== data.skillPercent) {
            this.elements.skillFill.style.width = `${data.skillPercent}%`;
            this.lastState.skillPercent = data.skillPercent;
        }

        // 3. 궁극기 게이지 업데이트
        if (this.lastState.ultPercent !== data.ultPercent) {
            const rounded = Math.floor(data.ultPercent);
            this.elements.ultFill.style.width = `${data.ultPercent}%`;
            this.elements.ultText.innerText = `ULT ${rounded}%`;
            
            // 100% 시 화려한 효과 (클래스 추가 등)
            if (rounded >= 100) {
                this.elements.ultText.classList.add('ready');
            } else {
                this.elements.ultText.classList.remove('ready');
            }
            
            this.lastState.ultPercent = data.ultPercent;
        }

        // 4. 버프/디버프 업데이트 (배열 내용 비교)
        const buffsStr = JSON.stringify(data.buffs);
        if (this.lastState.buffsStr !== buffsStr) {
            this.updateBuffs(data.buffs);
            this.lastState.buffsStr = buffsStr;
        }

        this.isDirty = false;
    }

    updateBuffs(buffs) {
        this.elements.buffList.innerHTML = '';
        buffs.forEach(buffId => {
            const icon = document.createElement('div');
            icon.className = 'mg-buff-icon';
            // 실제 이미지가 없을 수 있으므로 텍스트나 이모지라도 표시하게끔 IconManager가 도와야 함
            const iconPath = iconManager.getStatusIconPath(buffId);
            icon.innerHTML = `<img src="${iconPath}" onerror="this.src='/assets/icon/default_buff.png';">`;
            this.elements.buffList.appendChild(icon);
        });
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
