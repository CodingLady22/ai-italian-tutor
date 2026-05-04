import { useAuth } from "../context/AuthContext";
import { translations } from "../i18n/translations";

export const useTranslation = () => {
  const { user } = useAuth();
  
  // Default to English if language not set or not found in translations
  const lang = user?.supportLanguage || "English";
  const dictionary = translations[lang] || translations["English"];

  const t = (key) => {
    return dictionary[key] || key;
  };

  return { t, lang };
};