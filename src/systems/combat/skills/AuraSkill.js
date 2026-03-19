import Logger from '../../../utils/Logger.js';
import auraEffects from '../../graphics/AuraEffects.js';

/**
 * 오라 기반 스킬의 기초 클래스 (Aura Skill Base)
 * 역할: [주기적인 범위 내 아군/적군 감지 및 효과 적용]
 * 
 * 🦖 [개발자 노트]
 * 1. 매 프레임 충돌 체크를 하면 성능이 거덜납니다. (주기적 실행 필수)
 * 2. 시각적인 오라(AuraEffects)와 논리적인 오라(AuraSkill)를 분리하여 관리합니다.
 */
class AuraSkill {
    constructor(config = {}) {
        this.id = config.id || 'AuraSkill';
        this.radius = config.radius || 200;
        this.interval = config.interval || 1000; // 1초마다 감지
        this.color = config.color || 0xffffff;
        
        this.activeAuras = new Map(); // ownerId -> { auraSprite, timer }
    }

    /**
     * SkillManager/EntitySkillComponent 연동용 실행 메소드
     */
    execute(owner) {
        this.activate(owner);
    }

    /**
     * 오라 활성화 (유닛에게 오라를 부착하고 로직 시작)
     */
    activate(owner) {
        if (!owner) return;

        const ownerId = owner.logic.id;
        if (this.activeAuras.has(ownerId)) return;

        // 1. 시각 효과 부착
        const auraSprite = auraEffects.attachAura(owner, {
            color: this.color,
            radius: this.radius,
            blurSpeed: 'medium'
        });

        // 2. 주기적 로직 타이머 설정
        const timer = owner.scene.time.addEvent({
            delay: this.interval,
            loop: true,
            callback: () => this.tick(owner)
        });

        this.activeAuras.set(ownerId, { auraSprite, timer });
        Logger.info("SKILL", `Aura activated for ${owner.logic.name}: ${this.id}`);
    }

    /**
     * 오라 비활성화
     */
    deactivate(owner) {
        if (!owner) return;
        const ownerId = owner.logic.id;
        const data = this.activeAuras.get(ownerId);
        
        if (data) {
            data.auraSprite.release();
            data.timer.remove();
            this.activeAuras.delete(ownerId);
            Logger.info("SKILL", `Aura deactivated for ${owner.logic.name}: ${this.id}`);
        }
    }

    /**
     * 주기적으로 실행되는 오라 효과 로직
     */
    tick(owner) {
        if (!owner || !owner.active || !owner.logic.isAlive) {
            this.deactivate(owner);
            return;
        }

        // [FIX] 동적 범위 갱신 (마법 공격력 비례 등)
        if (this.updateDynamicRadius) {
            this.updateDynamicRadius(owner);
        }

        // 주변 대상 감지
        const targets = this.getNearbyTargets(owner);
        this.applyAuraEffect(owner, targets);
    }

    /**
     * 범위 내 대상 필터링
     */
    getNearbyTargets(owner) {
        const scene = owner.scene;
        // 아군 오라라면 아군을, 적군 오라라면 적군을 감지하도록 구현 필요
        // 예시: 모든 엔티티 중 거리 내에 있는 유닛 추출
        const allEntities = [...scene.allies, ...scene.enemies];
        return allEntities.filter(target => {
            if (!target.active || !target.logic.isAlive || target === owner) return false;
            const dist = Phaser.Math.Distance.Between(owner.x, owner.y, target.x, target.y);
            return dist <= this.radius;
        });
    }

    /**
     * [Abstract] 대상들에게 실제 효과 적용 (하위 클래스에서 오버라이드)
     */
    applyAuraEffect(owner, targets) {
        // Example: targets.forEach(t => t.applyBuff(...))
    }
}

export default AuraSkill;
