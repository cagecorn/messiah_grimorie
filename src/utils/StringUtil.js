/**
 * 문자열 유틸리티 (String Utilities)
 * 모든 용어의 일관성을 위해 대소문자 정규화를 담당합니다.
 */
const StringUtil = {
    /**
     * 키값 정규화 (대문자/소문자 혼용 방지)
     * 유저 규칙: 용병 이름 등을 대소문자 상관없이 통일해서 불러오게 함.
     * @param {string} key 
     * @returns {string} 소문자로 변환된 키
     */
    normalize: (key) => {
        if (typeof key !== 'string') return key;
        return key.trim().toLowerCase();
    }
};

export default StringUtil;
