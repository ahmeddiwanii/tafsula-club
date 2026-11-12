"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { DEFAULT_LOCALE, LOCALES, type Locale } from "../brand"
import { translate } from "./dictionaries"

const STORAGE_KEY = "tafsula_locale"

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  dir: "ltr" | "rtl"
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function isLocale(v: string | null | undefined): v is Locale {
  return !!v && (LOCALES as string[]).includes(v)
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (isLocale(saved)) setLocaleState(saved)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.lang = locale
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
    try {
      localStorage.setItem(STORAGE_KEY, locale)
      document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`
    } catch {
      /* ignore */
    }
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => translate(locale, key),
      dir: locale === "ar" ? "rtl" : "ltr",
    }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}

export function LocaleSwitcher({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  const { locale, setLocale } = useLocale()
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border-[1.5px] p-1 ${
        inverted ? "border-white/20 bg-white/10" : "border-soot/15 bg-soot/[0.04]"
      } ${className}`}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
            inverted
              ? locale === code
                ? "bg-white text-soot"
                : "text-white/60 hover:text-white"
              : locale === code
                ? "bg-soot text-jasmine"
                : "text-soot/50 hover:text-soot"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
