import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "zh";

const STORAGE_KEY = "catch.lang";

type LangValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  ready: boolean;
};

const LangContext = createContext<LangValue>({
  lang: "en",
  setLang: () => {},
  ready: false,
});

export function LangProvider({ children }: { children: ReactNode }) {
  // Chinese is the primary language, so the server renders zh and we resolve
  // any saved/browser preference after hydration.
  const [lang, setLangState] = useState<Lang>("zh");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let next: Lang = "zh";
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "zh") {
        next = saved;
      } else if (!/^zh/i.test(navigator.language ?? "")) {
        next = "en";
      }
    } catch {
      /* storage blocked — fall back to English */
    }
    setLangState(next);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang, ready]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, ready }), [lang, setLang, ready]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** t("English copy", "中文文案") */
export function useT() {
  const { lang } = useLang();
  return useCallback((en: string, zh: string) => (lang === "zh" ? zh : en), [lang]);
}

export function T({ en, zh }: { en: ReactNode; zh: ReactNode }) {
  const { lang } = useLang();
  return <>{lang === "zh" ? zh : en}</>;
}
