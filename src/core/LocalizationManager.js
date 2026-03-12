import common from './translations/common.js';
import territory from './translations/territory.js';
import gacha from './translations/gacha.js';

/**
 * 로컬라이제이션 매니저 (Localization Manager)
 * 중앙화된 용어 관리 시스템. 영어를 기본으로 하며 한국어를 지원합니다.
 * [갓 오브젝트 방지]를 위해 도메인별로 번역 파일을 분리하여 관리합니다.
 */
class LocalizationManager {
    constructor() {
        this.currentLanguage = 'en'; // 기본 언어: 영어
        
        // [MODULARIZATION] 도메인별 번역 데이터 병합
        this.translations = {
            en: { ...common.en, ...territory.en, ...gacha.en },
            ko: { ...common.ko, ...territory.ko, ...gacha.ko }
        };
    }

    /**
     * 언어 설정 변경
     * @param {string} lang 'en' or 'ko'
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            Logger.info("SYSTEM", `Language changed to: ${lang}`);
            EventBus.emit(EVENTS.LANGUAGE_CHANGED, lang);
        } else {
            Logger.warn("SYSTEM", `Unsupported language: ${lang}`);
        }
    }

    /**
     * 텍스트 가져오기
     * @param {string} key 번역 키값
     * @returns {string} 번역된 텍스트
     */
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
}

const localizationManager = new LocalizationManager();
export default localizationManager;
