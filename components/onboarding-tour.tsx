"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { LogoWordmark } from "@/components/brand/logo"
import { useLocale } from "@/lib/i18n/locale-context"

type Step = { title: string; body: string; href?: string; cta?: string }

const MEMBER_STEPS: Record<string, Step[]> = {
  en: [
    { title: "Welcome", body: "This is your club home. You can see news, events, teams, and tasks here.", href: "/dashboard/member", cta: "Open home" },
    { title: "Events", body: "See club events and join with one tap.", href: "/dashboard/member/events", cta: "See events" },
    { title: "Teams", body: "Accept team invites and pick a role.", href: "/dashboard/member/teams", cta: "See teams" },
    { title: "Tasks", body: "Do your tasks. When they are approved, you get points.", href: "/dashboard/member/tasks", cta: "See tasks" },
    { title: "Ideas", body: "Send ideas to the bureau and read club news.", href: "/dashboard/member/proposals", cta: "Send an idea" },
  ],
  fr: [
    { title: "Bienvenue", body: "Ici tu trouves l’actu, les événements, les équipes et les tâches.", href: "/dashboard/member", cta: "Voir l’accueil" },
    { title: "Événements", body: "Vois les événements et inscris-toi en un clic.", href: "/dashboard/member/events", cta: "Voir les événements" },
    { title: "Équipes", body: "Accepte les invitations et choisis un rôle.", href: "/dashboard/member/teams", cta: "Voir les équipes" },
    { title: "Tâches", body: "Fais tes tâches. Quand elles sont validées, tu gagnes des points.", href: "/dashboard/member/tasks", cta: "Voir les tâches" },
    { title: "Idées", body: "Envoie des idées au bureau et lis l’actu.", href: "/dashboard/member/proposals", cta: "Proposer" },
  ],
  ar: [
    { title: "مرحبًا", body: "هنا أخبار النادي والفعاليات والفرق والمهام.", href: "/dashboard/member", cta: "البداية" },
    { title: "الفعاليات", body: "تصفّح الفعاليات وسجّل بسهولة.", href: "/dashboard/member/events", cta: "الفعاليات" },
    { title: "الفرق", body: "اقبل الدعوات واختر دورًا.", href: "/dashboard/member/teams", cta: "الفرق" },
    { title: "المهام", body: "أنجز مهامك. بعد الموافقة تحصل على نقاط.", href: "/dashboard/member/tasks", cta: "المهام" },
    { title: "الأفكار", body: "أرسل أفكارًا للمكتب وتابع الأخبار.", href: "/dashboard/member/proposals", cta: "اقترح" },
  ],
}

const HR_STEPS: Record<string, Step[]> = {
  en: [
    { title: "Welcome, bureau", body: "This is where you invite people, create events, and run the club.", href: "/dashboard/hr", cta: "Open dashboard" },
    { title: "Invite people", body: "Add members and accept join requests.", href: "/dashboard/hr/members/invite", cta: "Invite someone" },
    { title: "Create an event", body: "Set the place and time. You can edit it later.", href: "/dashboard/hr/events/new", cta: "Create event" },
    { title: "Give tasks", body: "Create tasks, check the work, and give points.", href: "/dashboard/hr/tasks", cta: "Open tasks" },
    { title: "Club news", body: "Post news and reply to ideas. You can edit posts later.", href: "/dashboard/hr/home", cta: "Open news" },
  ],
  fr: [
    { title: "Bienvenue, bureau", body: "Ici tu invites, crées des événements et gères le club.", href: "/dashboard/hr", cta: "Ouvrir le tableau" },
    { title: "Inviter", body: "Ajoute des membres et accepte les demandes.", href: "/dashboard/hr/members/invite", cta: "Inviter" },
    { title: "Créer un événement", body: "Choisis le lieu et l’heure. Tu peux modifier après.", href: "/dashboard/hr/events/new", cta: "Créer" },
    { title: "Donner des tâches", body: "Crée, vérifie, donne des points.", href: "/dashboard/hr/tasks", cta: "Voir les tâches" },
    { title: "Actu du club", body: "Publie et réponds aux idées. Les posts restent modifiables.", href: "/dashboard/hr/home", cta: "Voir l’actu" },
  ],
  ar: [
    { title: "مرحبًا بالمكتب", body: "هنا تدعو الأعضاء وتنشئ الفعاليات وتدير النادي.", href: "/dashboard/hr", cta: "لوحة المكتب" },
    { title: "ادعُ الناس", body: "أضف أعضاء واقبل الطلبات.", href: "/dashboard/hr/members/invite", cta: "دعوة" },
    { title: "أنشئ فعالية", body: "حدد المكان والوقت. يمكنك التعديل لاحقًا.", href: "/dashboard/hr/events/new", cta: "فعالية جديدة" },
    { title: "وزّع المهام", body: "أنشئ وراجع وأعطِ نقاطًا.", href: "/dashboard/hr/tasks", cta: "المهام" },
    { title: "أخبار النادي", body: "انشر وعدّل المنشورات متى شئت.", href: "/dashboard/hr/home", cta: "الأخبار" },
  ],
}

const STORAGE_KEY = "tafsula_tour_v3"

export function OnboardingTour({ role = "member" }: { role?: "member" | "hr" }) {
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const pack = role === "hr" ? HR_STEPS : MEMBER_STEPS
  const steps = pack[locale] ?? pack.fr

  useEffect(() => {
    try {
      if (!localStorage.getItem(`${STORAGE_KEY}:${role}`)) setOpen(true)
    } catch {
      /* ignore */
    }
  }, [role])

  if (!open) return null

  const finish = () => {
    try {
      localStorage.setItem(`${STORAGE_KEY}:${role}`, "1")
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  const current = steps[step]

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-soot/55 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-[1.6rem] border-[3px] border-soot bg-jasmine p-5 text-soot shadow-[6px_8px_0_0_#161210] sm:p-6">
        <div className="mb-4 flex justify-center">
          <LogoWordmark href={null} compact className="h-10" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-pomegranate">
          {role === "hr" ? "Bureau guide" : "Member guide"} · {step + 1} / {steps.length}
        </p>
        <h2 className="mt-2 font-display text-xl text-soot sm:text-2xl" style={{ fontFamily: "Fraunces, serif" }}>
          {current.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-soot/65">{current.body}</p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button type="button" onClick={finish} className="rounded-full px-3 py-2 text-sm font-medium text-soot/45 hover:text-soot">
            Skip
          </button>
          <div className="ml-auto flex flex-wrap gap-2">
            {current.href && current.cta && (
              <Link
                href={current.href}
                onClick={finish}
                className="rounded-full border-[2px] border-soot bg-jasmine px-4 py-2 text-sm font-semibold text-soot no-underline"
              >
                {current.cta}
              </Link>
            )}
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="rounded-full bg-soot px-4 py-2 text-sm font-semibold text-jasmine"
              >
                Next
              </button>
            ) : (
              <button type="button" onClick={finish} className="rounded-full bg-soot px-4 py-2 text-sm font-semibold text-jasmine">
                Let&apos;s go
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
