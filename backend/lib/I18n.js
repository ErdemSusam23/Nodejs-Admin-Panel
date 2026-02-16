const i18n = require('../i18n'); 
const config = require('../config');

class I18n {
    constructor(lang) {
        // 1. Config'deki yazım hatası olsa bile kod çalışsın diye elle "EN" yedeği koydum.
        let defaultLang = config.DEFAULT_LANGUAGE || "EN"; 
        
        // 2. Gelen dili veya varsayılanı al, hepsini Büyük Harfe çevir (tr -> TR olsun diye)
        let activeLang = (lang || defaultLang).toUpperCase();

        // 3. Kontrol et: Bu dil bizim i18n dosyamızda tanımlı mı?
        // Eğer tanımlı değilse (örn: 'FR' geldiyse), varsayılan dile (EN) dön.
        if (!i18n[activeLang]) {
            activeLang = defaultLang.toUpperCase();
        }

        this.lang = activeLang;
    }

    translate(text, lang = this.lang, params = []) {
        let arr = text.split('.'); // ["USERS", "AUTH_ERROR"]

        let val = i18n[lang][arr[0]]; // i18n['EN']['USERS']

        for (let i = 1; i < arr.length; i++) {
            val = val[arr[i]];
        }

        val = val || text + " [MISSING]";

        if (params && params.length > 0) {
            for (let i = 0; i < params.length; i++) {
                val = val.replace('{}', params[i]);
            }
        }

        return val;
    }
}

module.exports = I18n;