import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./public/locales/en/common.json";
import uzCommon from "./public/locales/uz/common.json";
import ruCommon from "./public/locales/ru/common.json";

export const supportedLanguages = ["uz", "ru", "en"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
export const defaultLanguage: SupportedLanguage = "uz";

if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        resources: {
            en: { translation: enCommon },
            uz: { translation: uzCommon },
            ru: { translation: ruCommon },
        },
        lng: defaultLanguage,
        fallbackLng: defaultLanguage,
        supportedLngs: supportedLanguages,
        interpolation: { escapeValue: false },
    });
}

export default i18n;
