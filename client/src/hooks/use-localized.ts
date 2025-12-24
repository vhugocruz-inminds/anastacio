import { useTranslation } from "react-i18next";
import type { LocalizedText } from "@shared/schema";

export function useLocalized() {
  const { i18n } = useTranslation();
  
  const getLocalizedText = (
    localized: LocalizedText | undefined,
    fallback: string | null | undefined
  ): string => {
    if (!localized) {
      return fallback || "";
    }
    
    const lang = i18n.language;
    if (lang === "en-US" || lang === "en") {
      return localized.enUS || localized.ptBR || fallback || "";
    }
    return localized.ptBR || fallback || "";
  };
  
  return { getLocalizedText, currentLanguage: i18n.language };
}
