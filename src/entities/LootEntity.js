import Phaser from 'phaser';
import Logger from '../utils/Logger.js';

/**
 * 전리품 엔티티 (Loot Entity)
 * 역할: [바닥에 드랍된 아이템/골드 객체]
 * 
 * 설명: 몬스터 사망 시 생성되며, 일정 시간 동안 바닥에 머뭅니다.
 * 향후 펫 시스템이 수집할 수 있는 타겟이 됩니다.
 */
export default class LootEntity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        
        this.amount = 0;
        this.lootType = 'gold'; // 'gold', 'item'
        this.itemId = null;
        this.poolType = null;
        this.isCollected = false;
        
        // 그림자 및 물리 설정 가능 (필요 시)
    }

    /**
     * 초기화 (풀링 재사용 대응)
     */
    init(x, y, config) {
        this.setPosition(x, y);
        this.amount = config.amount || 0;
        this.lootType = config.lootType || 'gold';
        this.itemId = config.itemId || null;
        this.isCollected = false;
        this.alpha = 1;
        this.setScale(config.scale || 0.4);

        // [인터랙션] 유저가 직접 클릭 가능하도록 설정
        this.setInteractive({ useHandCursor: true });
        this.off('pointerdown'); // 기존 리스너 제거
        this.on('pointerdown', () => this.collect());

        // [신규] 텍스처 동적 설정
        if (this.lootType === 'gold') {
            import('../core/EmojiManager.js').then(m => {
                const k = m.default.getAssetKey('🪙');
                this.setTexture(k);
            });
        } else if (this.itemId) {
            import('../core/EmojiManager.js').then(m => {
                const k = m.default.getAssetKey(this.itemId);
                if (k) this.setTexture(k);
            });
        }
        
        this.setActive(true);
        this.setVisible(true);
        
        this.playPopAnimation();
    }

    /**
     * 튀어오르는 초기 애니메이션
     */
    playPopAnimation() {
        const jumpHeight = 50 + Math.random() * 50;
        const jumpDuration = 400 + Math.random() * 200;
        const scatterRange = 80;
        
        const targetX = this.x + (Math.random() - 0.5) * scatterRange;
        const targetY = this.y; // 바닥 높이 유지
        
        // 포물선 점프 구현 (중력 느낌)
        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY - jumpHeight,
            duration: jumpDuration / 2,
            ease: 'Cubic.out',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this,
                    y: targetY,
                    duration: jumpDuration / 2,
                    ease: 'Bounce.out'
                });
            }
        });

        // 회전 효과 추가
        this.scene.tweens.add({
            targets: this,
            angle: 360 * (Math.random() > 0.5 ? 1 : -1),
            duration: jumpDuration,
            ease: 'Power1'
        });
    }

    /**
     * 수집 처리 (유닛 충돌 or 유저 클릭)
     */
    async collect() {
        if (this.isCollected) return;
        this.isCollected = true;
        
        // 1. 데이터 베이스 / 매니저에 반영
        if (this.lootType === 'gold') {
            const currencyManager = (await import('../core/CurrencyManager.js')).default;
            currencyManager.add('gold', this.amount);
        } else if (this.itemId) {
            const messiahInventoryManager = (await import('../systems/MessiahInventoryManager.js')).default;
            await messiahInventoryManager.acquireItem(this.itemId, 1);
        }

        Logger.info("LOOT", `Collected: ${this.lootType === 'gold' ? this.amount + ' Gold' : this.itemId}`);

        // 2. 수집 애니메이션 (HUD로 날아가는 대신 위로 사라짐)
        this.scene.tweens.add({
            targets: this,
            y: this.y - 100,
            alpha: 0,
            scale: 0.2,
            duration: 400,
            ease: 'Back.in',
            onComplete: () => {
                this.release();
            }
        });
    }

    release() {
        if (this.poolType) {
            // [FIX] 직접 import 대신 싱글톤 패턴이 이미 로드되어 있을 확률이 높으므로 
            // 전역 훅이나 사전에 로드된 매니저를 참조하도록 구조화하거나 
            // 현재 구조에서는 동적 import를 유지하되 절대경로/표준화된 상대경로 사용
            import('../core/PoolingManager.js').then(m => {
                m.default.release(this.poolType, this);
            });
        } else {
            this.destroy();
        }
    }

    onAcquire() { }
    onRelease() {
        this.setActive(false);
        this.setVisible(false);
    }
}
