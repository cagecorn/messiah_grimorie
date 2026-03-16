import TotemistAI from './TotemistAI.js';

/**
 * 주주 전용 AI (Joojoo AI)
 * 역할: [기본적인 토템술사 동작 수행]
 */
class JoojooAI {
    static execute(entity, bb, delta) {
        // 현재는 특수 로직 없이 기본 클래스 AI 호출
        TotemistAI.execute(entity, bb, delta);
    }
}

export default JoojooAI;
