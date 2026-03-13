import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import measurementManager from '../core/MeasurementManager.js';
import layerManager from '../ui/LayerManager.js';

/**
 * 전투 엔티티 (Combat Entity)
 * 역할: [Phaser 물리 객체 + 하위 BaseEntity 로직 통합]
 * 
 * 설명: 실제 월드에 렌더링되는 스프라이트 객체입니다.
 * 물리 엔진(Physics)을 포함하며, 핀치/플립 등 시각적 처리와
 * 내부 BaseEntity 스탯/로직을 연결합니다.
 */
export default class CombatEntity extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {BaseEntity} logicEntity 
     * @param {string} spriteKey 
     */
    constructor(scene, x, y, logicEntity, spriteKey) {
        super(scene, x, y);
        
        this.logic = logicEntity;
        this.spriteKey = spriteKey;
        
        // [측량 매니저] 수치 가져오기
        const config = this.getEntityConfig();
        
        // 1. 스프라이트 설정
        this.sprite = scene.add.sprite(0, 0, spriteKey);
        this.sprite.setOrigin(0.5, 1.0); // 발밑(Bottom-Center)을 기준으로 정렬
        this.sprite.setScale(config.displayScale);
        this.add(this.sprite);

        // [신규] 고도(Altitude) 로직: 컨테이너의 (0,0)은 항상 지면(Feet)
        // 스프라이트의 Origin이 (0.5, 1.0)이므로 y=0일 때 발이 지면에 닿음
        this.zHeight = 0; 

        // 2. 물리 엔진 등록 (Arcade Physics)
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        
        // 히트박스 중심 조정 (반경 20 원형)
        // 발밑(0,0)에서 위쪽 방향으로 오프셋을 주어 몸통 중앙에 위치시킴
        this.body.setCircle(20, -20, -45); 

        // [신규] 레이어 관리 통합 및 Y-Sorting 준비
        this.baseDepth = layerManager.getDepth('entities');
        this.updateDepth();
        
        // 3. 초기 방향 설정 (팀에 따라 다름)
        // 기본 스프라이트가 왼쪽을 보므로:
        // 아군(왼쪽 배치)은 오른쪽을 봐야 함 -> setFlipX(true)
        // 적군(오른쪽 배치)은 왼쪽을 봐야 함 -> setFlipX(false)
        if (this.logic.type === 'mercenary') {
            this.sprite.setFlipX(true);
        } else {
            this.sprite.setFlipX(false);
        }

        // 4. 메타데이터
        this.id = logicEntity.id;
        this.team = logicEntity.type; // 'mercenary' or 'monster'

        scene.add.existing(this);
        this.setActive(true);
        Logger.info("COMBAT_ENTITY", `Spawned ${this.logic.name} at (${x}, ${y})`);
    }

    /**
     * 엔티티 타입 및 상태에 따른 스케일/히트박스 설정 가져오기
     */
    getEntityConfig() {
        const entityData = measurementManager.get('entity');
        let displayScale = 1.0;
        let bodyRadius = 20;

        if (this.logic.type === 'mercenary') {
            displayScale = entityData.mercenary.scale;
            bodyRadius = entityData.mercenary.bodyRadius;
        } else if (this.logic.type === 'monster') {
            displayScale = entityData.monster.scale;
            // 보스 여부 판단
            if (this.logic.id.includes('boss')) {
                displayScale = entityData.monster.bossScale;
            }
        } else if (this.logic.type === 'pet') {
            displayScale = entityData.pet[this.logic.id] || 0.5;
        }

        return { displayScale, bodyRadius };
    }

    /**
     * 이동 처리 (MovementManager에서 호출)
     */
    setVelocity(vx, vy) {
        if (!this.body) return;
        this.body.setVelocity(vx, vy);

        // [방향 제어] 기본이 왼쪽인 이미지 기준:
        // 우측 이동(vx > 0) -> Flip(true) -> 오른쪽 바라봄
        // 좌측 이동(vx < 0) -> No Flip(false) -> 왼쪽 바라봄
        if (vx > 0) {
            this.sprite.setFlipX(true);
        } else if (vx < 0) {
            this.sprite.setFlipX(false);
        }
    }

    /**
     * 정지 처리
     */
    stop() {
        if (!this.body) return;
        this.body.setVelocity(0, 0);
    }

    /**
     * 고도(Z-Axis) 설정 및 시각적 오프셋 적용
     * @param {number} h 높이 값 (px)
     */
    setHeight(h) {
        this.zHeight = h;
        // 스프라이트의 Origin이 (0.5, 1.0)이므로, y=0이 발밑입니다.
        // 공중에 띄우려면 마이너스(-) 방향으로만 오프셋을 주면 됩니다.
        this.sprite.setY(-h);
        
        // 비행 유닛인 경우 로컬 바 가독성을 위해 같이 올릴 수도 있음 (필요 시 확장)
    }

    /**
     * Y축 기준 깊이 정렬 업데이트
     * 위치가 아래일수록(y값이 클수록) 앞에 렌더링되도록 함
     */
    updateDepth() {
        // baseDepth(100) + (y / worldHeight) 를 통해 100~101 사이의 값으로 정밀 정렬
        const worldHeight = measurementManager.world.height;
        const yBias = this.y / worldHeight;
        this.setDepth(this.baseDepth + yBias);
    }
}
