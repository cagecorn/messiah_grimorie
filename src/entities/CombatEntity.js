import Phaser from 'phaser';
import Logger from '../utils/Logger.js';
import measurementManager from '../core/MeasurementManager.js';

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
        
        // 1. 스프라이트 추가
        this.sprite = scene.add.sprite(0, 0, spriteKey);
        this.sprite.setScale(config.displayScale); // 시각적 배율 적용
        this.add(this.sprite);

        // 2. 물리 엔진 등록 (Arcade Physics)
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        
        // [규칙] 히트박스는 반경 20px 원형 (지름 40px)
        const radius = config.bodyRadius || 20;
        this.body.setCircle(radius);
        this.body.setOffset(-radius, -radius); // 컨테이너 중심에 맞춤

        // 3. 방향 설정 (팀에 따라 다름)
        if (this.logic.type === 'monster') {
            this.sprite.setFlipX(true); // 몬스터는 기본적으로 왼쪽을 봄
        }

        // 4. 메타데이터
        this.id = logicEntity.id;
        this.team = logicEntity.type; // 'mercenary' or 'monster'

        scene.add.existing(this);
        Logger.info("COMBAT_ENTITY", `Spawned ${this.logic.name} at (${x}, ${y}) with scale ${config.displayScale}`);
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
            // 보스 여부 판단 (데이터 파일의 isSpecial이나 보스 접두사 등 활용 가능)
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

        // 이동 방향에 따른 플립 처리
        if (vx > 0) {
            this.sprite.setFlipX(false);
        } else if (vx < 0) {
            this.sprite.setFlipX(true);
        }
    }

    /**
     * 정지 처리
     */
    stop() {
        if (!this.body) return;
        this.body.setVelocity(0, 0);
    }
}
