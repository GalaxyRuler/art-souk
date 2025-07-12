import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export function useLanguage() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    document.documentElement.setAttribute("lang", i18n.language);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  }, [i18n.language, isRTL]);

  return {
    language: i18n.language,
    toggleLanguage,
    isRTL,
  };
}
