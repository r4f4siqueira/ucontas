"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { pt, type Dictionary } from "./dictionaries/pt";
import { en } from "./dictionaries/en";

export type Language = "pt" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  text: Dictionary;
}

const dictionaries: Record<Language, Dictionary> = {
  pt,
  en,
};

const LanguageContext = createContext<LanguageContextType>({
  language: "pt",
  setLanguage: () => {},
  text: pt,
});

const STORAGE_KEY = "ucontas_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && (stored === "pt" || stored === "en")) {
      setLanguageState(stored);
      document.documentElement.lang = stored === "pt" ? "pt-BR" : "en";
    } else {
      const browserLang = navigator.language?.toLowerCase();
      if (browserLang.startsWith("en")) {
        setLanguageState("en");
        document.documentElement.lang = "en";
      } else {
        setLanguageState("pt");
        document.documentElement.lang = "pt-BR";
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  };

  const text = dictionaries[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, text }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
