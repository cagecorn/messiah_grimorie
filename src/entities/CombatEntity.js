import Phaser from 'phaser';
import Logger from '../utils/Logger.js';

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
        
        // 1. 스프라이트 추가
        this.sprite = scene.add.sprite(0, 0, spriteKey);
        this.sprite.setScale(1.5); // 시각적 배율
        this.add(this.sprite);

        // 2. 물리 엔진 등록 (Arcade Physics)
        scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        this.body.setSize(40, 60); // 충돌 박스 설정

        // 3. 방향 설정 (팀에 따라 다름)
        if (this.logic.type === 'monster') {
            this.sprite.setFlipX(true); // 몬스터는 기본적으로 왼쪽을 봄
        }

        // 4. 메타데이터
        this.id = logicEntity.id;
        this.team = logicEntity.type; // 'mercenary' or 'monster'

        scene.add.existing(this);
        Logger.info("COMBAT_ENTITY", `Spawned ${this.logic.name} at (${x}, ${y})`);
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
