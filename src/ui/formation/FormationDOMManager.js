import Logger from '../../utils/Logger.js';
import EventBus, { EVENTS } from '../../core/EventBus.js';
import domManager from '../DOMManager.js';
import formationManager from '../../systems/FormationManager.js';
import mercenaryManager from '../../systems/entities/MercenaryManager.js';
import mercenaryCollectionManager from '../../systems/MercenaryCollectionManager.js';
import assetPathManager from '../../core/AssetPathManager.js';

/**
 * 편성 DOM 매니저 (Formation DOM Manager)
 * 역할: [편성 UI 렌더링 및 드래그 앤 드롭 로직]
 */
class FormationDOMManager {
    constructor() {
        this.container = null;
        this.draggedMercId = null;
        
        this.setupListeners();
    }

    setupListeners() {
        EventBus.on(EVENTS.SCENE_CHANGED, (scene) => {
            if (scene === 'FormationScene') {
                this.show();
            } else {
                this.hide();
            }
        });

        EventBus.on('COLLECTION_UPDATED', () => {
            if (this.container && this.container.style.display === 'flex') {
                this.refresh();
            }
        });
    }

    show() {
        if (!this.container) {
            this.createUI();
        }
        this.container.style.display = 'flex';
        this.refresh();
    }

    createUI() {
        this.container = document.createElement('div');
        this.container.className = 'formation-overlay';
        
        // 상단 타이틀
        const title = document.createElement('h1');
        title.innerText = '🛡️ TACTICAL FORMATION';
        title.style.color = 'var(--mg-gold)';
        title.style.marginBottom = '30px';
        this.container.appendChild(title);

        // [구역 1] 6개 슬롯 컨테이너
        this.slotsContainer = document.createElement('div');
        this.slotsContainer.className = 'formation-slots-container';
        this.container.appendChild(this.slotsContainer);

        // [구역 2] 용병 보유 목록 (Roster)
        this.rosterContainer = document.createElement('div');
        this.rosterContainer.className = 'formation-roster-container';
        this.container.appendChild(this.rosterContainer);

        // [구역 3] 하단 버튼
        const footer = document.createElement('div');
        footer.className = 'formation-footer';

        const btnConfirm = document.createElement('button');
        btnConfirm.className = 'formation-btn btn-confirm';
        btnConfirm.innerText = 'BATTLE STANDBY';
        btnConfirm.onclick = () => this.hide();
        
        const btnCancel = document.createElement('button');
        btnCancel.className = 'formation-btn btn-cancel';
        btnCancel.innerText = 'BACK';
        btnCancel.onclick = () => {
            EventBus.emit('UI_OPEN_TERRITORY');
        };

        footer.appendChild(btnCancel);
        footer.appendChild(btnConfirm);
        this.container.appendChild(footer);

        domManager.addToLayer('overlay', this.container);
    }

    refresh() {
        this.renderSlots();
        this.renderRoster();
    }

    renderSlots() {
        this.slotsContainer.innerHTML = '';
        const currentFormation = formationManager.getFormation();

        currentFormation.forEach((mercId, index) => {
            const slot = document.createElement('div');
            slot.className = `formation-slot ${mercId ? 'active' : ''}`;
            slot.dataset.index = index;

            slot.innerHTML = `<div class="slot-index-badge">SLOT ${index + 1}</div>`;

            if (mercId) {
                const merc = mercenaryManager.registry[mercId.toLowerCase()];
                if (merc) {
                    const img = document.createElement('img');
                    img.src = assetPathManager.getMercenaryPath(mercId, 'sprite');
                    img.style.width = '70%';
                    img.style.pointerEvents = 'none'; // 이미지 클릭 방지 (슬롯 클릭 우선)
                    slot.appendChild(img);

                    const name = document.createElement('span');
                    name.innerText = merc.name;
                    name.style.fontSize = '10px';
                    name.style.color = '#fff';
                    slot.appendChild(name);
                }
            }

            // 드롭 관련 이벤트
            slot.ondragover = (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            };
            slot.ondragleave = () => slot.classList.remove('drag-over');
            slot.ondrop = (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                if (this.draggedMercId) {
                    formationManager.assignMercenary(index, this.draggedMercId);
                    this.refresh();
                }
            };

            // 클릭 시 해제 (우클릭 혹은 특정 동작)
            slot.onclick = () => {
                if (currentFormation[index]) {
                    formationManager.removeMercenary(index);
                    this.refresh();
                }
            };

            this.slotsContainer.appendChild(slot);
        });
    }

    renderRoster() {
        this.rosterContainer.innerHTML = '';
        const currentFormation = formationManager.getFormation();
        
        // [Hardcode-Free] 수집 매니저에서 보유한 용병 목록만 가져옴
        const ownedList = mercenaryCollectionManager.getOwnedList();
        
        ownedList.forEach(mercData => {
            const id = mercData.id;
            const isDeployed = currentFormation.includes(id);

            const card = document.createElement('div');
            card.className = `formation-card ${isDeployed ? 'deployed' : ''}`;
            card.draggable = !isDeployed;

            // 레지스트리에서 원본 데이터(이름 등) 가져오기
            const registryData = mercenaryManager.registry[id];
            if (!registryData) return;

            card.innerHTML = `
                <div class="card-sprite">
                    <img src="${assetPathManager.getMercenaryPath(id, 'sprite')}">
                </div>
                <div class="card-info">
                    <span class="card-name">${registryData.name}</span>
                    <span class="card-stars">★${mercData.stars}</span>
                </div>
            `;

            if (!isDeployed) {
                card.ondragstart = () => {
                    this.draggedMercId = id;
                    card.style.opacity = '0.5';
                };
                card.ondragend = () => {
                    this.draggedMercId = null;
                    card.style.opacity = '1';
                };
                // 클릭으로도 배치 가능하게 (자동 빈 슬롯)
                card.onclick = () => {
                    const emptySlot = currentFormation.indexOf(null);
                    if (emptySlot !== -1) {
                        formationManager.assignMercenary(emptySlot, id);
                        this.refresh();
                    }
                };
            }

            this.rosterContainer.appendChild(card);
        });
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}

const formationDOMManager = new FormationDOMManager();
export default formationDOMManager;
