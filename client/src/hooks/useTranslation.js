import { useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { translations } from "../i18n/translations";

export const useTranslation = () => {
  const { user } = useAuth();
  
  // Default to English if language not set or not found in translations
  const lang = user?.supportLanguage || "English";
  const dictionary = useMemo(() => translations[lang] || translations["English"], [lang]);

  const t = useCallback((key) => {
    return dictionary[key] || key;
  }, [dictionary]);

  return { t, lang };
};