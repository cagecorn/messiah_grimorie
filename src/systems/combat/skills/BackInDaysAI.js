/**
 * 왕년엔 말이야... AI (Back In the Days AI)
 */
class BackInDaysAI {
    /**
     * 궁극기 사용 여부 결정
     */
    decide(owner) {
        // 궁극기는 게이지가 차면 바로 사용 (전투 상황 가정)
        return true;
    }
}

const backInDaysAI = new BackInDaysAI();
export default backInDaysAI;
