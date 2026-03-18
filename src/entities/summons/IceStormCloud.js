import Phaser from 'phaser';
import Dummy from '../Dummy.js';
import IceStormCloudAI from '../../systems/ai/nodes/IceStormCloudAI.js';
import poolingManager from '../../core/PoolingManager.js';

/**
 * 아이스스톰 구름 (Ice Storm Cloud - Dummy version)
 * 역할: [최소한의 리소스로 동작하는 소환물]
 */
export default class IceStormCloud extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, logicEntity, spriteKey) {
        super(scene, x, y, spriteKey || 'ice_storm_cloud');
        
        this.scene = scene;
        this.logic = logicEntity;
        
        // 시각 보조용 풀링된 구름 연출 추가 (본체와 함께 이동하도록 보관)
        this.fxLayer = poolingManager.get('ice_storm_cloud_fx');
        if (this.fxLayer) {
            this.fxLayer.show(x, y, { duration: this.logic.duration });
        }
        this.team = 'ally'; // 기본값 (spawnSummon에서 덮어씌워짐)
        
        // Dummy 인터페이스 믹스인 (updateAttackCooldown, takeDamage 등이 안전하게 작동하도록)
        Dummy.applyMethods(this);
        
        scene.add.existing(this);
        this.setAlpha(0.8);
        this.setScale(1.5);
        this.setDepth(2000);

        // 둥실둥실 연출
        this.scene.tweens.add({
            targets: this,
            y: '+=15',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // [Standard Interface] 시스템(BattleScene)이 메 프레임 호출
    updateAttackCooldown(delta) {
        if (!this.active || !this.logic.isAlive) {
            this.handleDeath();
            return;
        }

        // 구름 고유 AI 실행
        IceStormCloudAI.tick(this, delta);

        // [FIX] 보조 비주얼 레이어 위치 동기화 (잔상 버그 해결)
        if (this.fxLayer) {
            this.fxLayer.updatePosition(this.x, this.y);
        }
    }

    handleDeath() {
        if (!this.active) return;
        
        // 사라지는 연출 후 제거
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.5,
            duration: 800,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}
