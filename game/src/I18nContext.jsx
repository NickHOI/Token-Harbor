import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { entity, LANGUAGES, LANGUAGE_STORAGE_KEY, numberLocale, resolvePreferredLanguage, translate } from "./i18n.js";
import { getState, sendAction } from "./lib/api.js";

const I18nContext = createContext(null);

function isSupportedLanguage(language) {
  return LANGUAGES.some((item) => item.id === language);
}

async function persistSharedLanguage(language) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const state = await getState();
    try {
      await sendAction({ type: "set_language", language }, {
        worldId: state.multiplayer.world.id,
        baseRevision: state.multiplayer.revision
      });
      return;
    } catch (error) {
      if (error.status !== 409 || attempt > 0) throw error;
    }
  }
}

function initialLanguage() {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (LANGUAGES.some((language) => language.id === stored)) return stored;
  return resolvePreferredLanguage(window.navigator.languages || [window.navigator.language]);
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(initialLanguage);
  const firstLanguage = useRef(language);
  const userChangedLanguage = useRef(false);

  const setLanguage = useCallback((nextLanguage) => {
    if (!isSupportedLanguage(nextLanguage)) return;
    userChangedLanguage.current = true;
    setLanguageState(nextLanguage);
    persistSharedLanguage(nextLanguage).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/state", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load interface language.");
        return response.json();
      })
      .then((state) => {
        if (!active || userChangedLanguage.current) return;
        const sharedLanguage = state?.preferences?.language;
        if (isSupportedLanguage(sharedLanguage)) {
          setLanguageState(sharedLanguage);
        } else {
          persistSharedLanguage(firstLanguage.current).catch(() => {});
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => ({
    language,
    languages: LANGUAGES,
    setLanguage,
    t: (key, variables) => translate(language, key, variables),
    name: (group, id, fallback, index) => entity(language, group, id, fallback, index),
    formatNumber: (number) => new Intl.NumberFormat(numberLocale(language), { maximumFractionDigits: 1 }).format(number || 0)
  }), [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
