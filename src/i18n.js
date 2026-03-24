import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_title": "WillMaker",
      "gov_portal": "Government Portal",
      "dashboard_title": "Citizen Dashboard",
      "new_will": "New Will"
    }
  },
  hi: {
    translation: {
      "app_title": "विलमेकर",
      "gov_portal": "सरकारी पोर्टल",
      "dashboard_title": "नागरिक डैशबोर्ड",
      "new_will": "नया वसीयतनामा"
    }
  },
  mr: {
    translation: {
      "app_title": "विलमेकर",
      "gov_portal": "सरकारी पोर्टल",
      "dashboard_title": "नागरिक डॅशबोर्ड",
      "new_will": "नवीन मृत्युपत्र"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", 
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
