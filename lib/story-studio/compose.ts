import { briefSignals, hashPick, normTitle, titleFromBrief, titleMatchesBrief } from "./brief"
import { detectLocale } from "./llm"
import { pickTheme } from "./theme"
import type { OrgActivityContext, StoryDeck, StoryLocale, StorySlide, StoryVoice } from "./types"

function iconFor(layout: StorySlide["layout"], type?: string) {
  const t = (type || "").toUpperCase()
  if (layout === "cover") return "flag"
  if (layout === "kpis") return "gauge"
  if (layout === "timeline") return "calendar"
  if (layout === "chapter") return "map"
  if (layout === "quote") return "quote"
  if (layout === "gallery") return "images"
  if (layout === "split") return "users"
  if (layout === "closing") return "door"
  if (t === "WORKSHOP") return "pencil"
  if (t === "TRAINING") return "grad"
  if (t === "CONFERENCE") return "mic"
  return "spark"
}

function focusEvents(ctx: OrgActivityContext) {
  return ctx.events
}

function fmtLong(iso: string, locale: StoryLocale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

function fmtDay(iso: string, locale: StoryLocale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : locale === "fr" ? "fr" : "en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

function typeLabel(type: string, locale: StoryLocale) {
  const key = type.toUpperCase()
  const map: Record<string, Record<StoryLocale, string>> = {
    WORKSHOP: { en: "workshop", fr: "atelier", ar: "ورشة" },
    TRAINING: { en: "training", fr: "formation", ar: "تدريب" },
    CONFERENCE: { en: "conference", fr: "conférence", ar: "مؤتمر" },
    GENERAL: { en: "club night", fr: "soirée club", ar: "أمسية" },
  }
  return map[key]?.[locale] || type.toLowerCase()
}

function quoteFor(type: string, locale: StoryLocale, title: string, brief: string) {
  const sig = briefSignals(brief)
  const t = type.toUpperCase()
  const bank: Record<string, Record<StoryLocale, string[]>> = {
    WORKSHOP: {
      en: [
        "Hands remember what lectures forget.",
        "A room that learns together does not leave empty-handed.",
      ],
      fr: ["Les mains retiennent ce que les discours oublient.", "Une salle qui apprend ensemble ne part jamais vide."],
      ar: ["اليد تتذكر ما تنساه المحاضرة.", "قاعة تتعلم معًا لا تخرج خالية."],
    },
    TRAINING: {
      en: ["Skill is a door you build, then walk through.", "Practice is how a club becomes a house."],
      fr: ["La compétence est une porte qu’on construit, puis qu’on traverse.", "S’entraîner, c’est faire du club une maison."],
      ar: ["المهارة باب تبنيه ثم تعبره.", "التدريب يجعل النادي بيتًا."],
    },
    CONFERENCE: {
      en: ["A good talk leaves the room braver than it entered.", "Voices in a hall can still feel like a kitchen table."],
      fr: ["Une bonne parole laisse la salle plus brave qu’elle n’est entrée.", "Des voix dans un hall peuvent encore ressembler à une table de cuisine."],
      ar: ["الكلمة الطيبة تترك القاعة أشجع مما دخلت.", "أصوات في قاعة قد تشبه مائدة البيت."],
    },
    GENERAL: {
      en: ["The night is not décor. It is proof we showed up.", "Doors held open are a kind of love."],
      fr: ["La nuit n’est pas un décor. C’est la preuve qu’on est venu.", "Tenir la porte, c’est déjà aimer le club."],
      ar: ["الليلة ليست ديكورًا. هي دليل أننا جئنا.", "إبقاء الباب مفتوحًا ضرب من المحبة."],
    },
  }
  const funny = {
    en: ["If the room laughed, the night counted.", "Bring snacks. Leave with a story."],
    fr: ["Si la salle a ri, la nuit compte.", "Apportez des snacks. Partez avec une histoire."],
    ar: ["إن ضحكت القاعة، حُسبت الليلة."],
  }
  const sponsor = {
    en: ["Proof, not folklore — this is what partners can stand next to.", "A room that filled is a number you can take to a table."],
    fr: ["La preuve, pas le folklore — voilà ce qu’un partenaire peut signer.", "Une salle pleine est un chiffre qu’on peut poser sur une table."],
    ar: ["دليل لا إشاعة."],
  }
  const extra = sig.funny ? funny[locale] : sig.sponsor ? sponsor[locale] : []
  const list = [...extra, ...(bank[t]?.[locale] || bank.GENERAL[locale])]
  return hashPick(`${brief}|${title}|${type}`, list)
}

function eventBody(event: OrgActivityContext["events"][number], locale: StoryLocale, brief: string) {
  const when = fmtLong(event.startAt, locale)
  const place = [event.venue, event.location].filter(Boolean).join(" · ")
  const kind = typeLabel(event.type, locale)
  const format = (event.format || "IN_PERSON").replace(/_/g, " ").toLowerCase()
  const story = event.description || event.summary || ""
  const numbers =
    locale === "fr"
      ? `${event.registrations} inscriptions, ${event.attendances} présences${event.rating ? `, note ${event.rating}/5` : ""}.`
      : locale === "ar"
        ? `${event.registrations} تسجيلًا، ${event.attendances} حضورًا${event.rating ? `، تقييم ${event.rating}/5` : ""}.`
        : `${event.registrations} signed up. ${event.attendances} walked in${event.rating ? `. Guests rated it ${event.rating}/5` : ""}.`

  const sig = briefSignals(brief)
  const angle = sig.funny
    ? locale === "fr"
      ? "Angle demandé : léger, vivant, presque une blague tenue."
      : "Angle you asked for: light, alive, almost a joke that still happened."
    : sig.sponsor
      ? locale === "fr"
        ? "Angle demandé : lisible pour un partenaire — chiffres, salle, preuve."
        : "Angle you asked for: readable for a partner — numbers, room, proof."
      : brief.slice(0, 110)

  if (locale === "fr") {
    return `${angle} Le ${when}, « ${event.title} » a ouvert comme ${kind} (${format})${place ? ` — ${place}` : ""}. ${story} ${numbers}`
  }
  if (locale === "ar") {
    return `${angle} في ${when} فُتحت «${event.title}» كـ${kind} (${format})${place ? ` — ${place}` : ""}. ${story} ${numbers}`
  }
  return `${angle} On ${when}, ${event.title} opened as a ${kind} (${format})${place ? ` at ${place}` : ""}. ${story} ${numbers}`
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export function composeFallbackDeck(ctx: OrgActivityContext, brief: string, localeHint?: StoryLocale): StoryDeck {
  const locale = detectLocale(brief, localeHint)
  const events = focusEvents(ctx)
  const cover = events.find((e) => e.posterUrl)?.posterUrl || ctx.organization.coverUrl || ctx.organization.gallery[0]
  const slides: StorySlide[] = []
  const loc = ctx.organization.location || "Tunis"
  const briefLine = brief.replace(/\s+/g, " ").trim()
  const theme = pickTheme(`${ctx.organization.id}|${briefLine}|${ctx.period.label}`, briefLine)
  const focused = events.length === 1
  const headline = titleFromBrief(ctx.organization.name, briefLine, events[0]?.title)

  slides.push({
    layout: "cover",
    icon: iconFor("cover"),
    kicker: briefLine.slice(0, 72) || (focused ? events[0].title : locale === "fr" ? "Saison professionnelle" : "Professional season recap"),
    title: headline,
    body: focused
      ? eventBody(events[0], locale, briefLine)
      : briefLine
        ? `${briefLine} — ${ctx.period.label}. ${ctx.organization.bio || ""}`.slice(0, 420)
        : ctx.organization.bio ||
          `From ${ctx.period.label}, ${ctx.organization.name} held ${events.length} activities in ${loc}.`,
    imageUrl: cover || undefined,
    caption: focused ? fmtLong(events[0].startAt, locale) : ctx.period.label,
  })

  slides.push({
    layout: "quote",
    icon: iconFor("quote"),
    kicker: locale === "fr" ? "Épigraphe" : "Epigraph",
    title: "",
    quote:
      locale === "fr"
        ? "On ne mesure pas un club aux messages. On le mesure aux salles qu’il a ouvertes, et aux gens qui sont restés."
        : "A club is not measured in chats. It is measured in rooms it opened, and in the people who stayed.",
    quoteBy: ctx.organization.name,
  })

  slides.push({
    layout: "kpis",
    icon: iconFor("kpis"),
    kicker: focused
      ? locale === "fr"
        ? "Cette activité en chiffres"
        : "This night in numbers"
      : locale === "fr"
        ? "La saison en chiffres"
        : "The season in numbers",
    title: focused
      ? events[0].title
      : locale === "fr"
        ? "Ce que le club a réellement fait"
        : "What we can stand behind",
    body: focused
      ? eventBody(events[0], locale, briefLine)
      : locale === "fr"
        ? `Entre ${ctx.period.label}, le rythme n’était pas du folklore : des portes, des équipes, des présences. Des chiffres qu’on peut lire à voix haute.`
        : `Between ${ctx.period.label} the rhythm was not folklore: doors, crews, check-ins. Numbers you can read out loud.`,
    metrics: focused
      ? [
          { label: locale === "fr" ? "inscrits" : "signed up", value: String(events[0].registrations) },
          { label: locale === "fr" ? "présences" : "in the room", value: String(events[0].attendances) },
          { label: locale === "fr" ? "note" : "rating", value: events[0].rating ? `${events[0].rating}/5` : "—" },
          { label: locale === "fr" ? "format" : "format", value: typeLabel(events[0].type, locale) },
        ]
      : [
          { label: locale === "fr" ? "membres" : "members", value: String(ctx.stats.membersAccepted), hint: `${ctx.stats.membersJoinedInPeriod} ${locale === "fr" ? "arrivés sur la période" : "joined this window"}` },
          { label: locale === "fr" ? "activités" : "activities", value: String(ctx.stats.events) },
          { label: locale === "fr" ? "présences" : "check-ins", value: String(ctx.stats.attendances), hint: `${ctx.stats.registrations} ${locale === "fr" ? "inscrits" : "signed up"}` },
          { label: locale === "fr" ? "tâches closes" : "tasks closed", value: String(ctx.stats.tasksCompleted || ctx.stats.teams) },
        ],
  })

  if (events.length > 1) {
    slides.push({
      layout: "chapter",
      icon: iconFor("chapter"),
      kicker: locale === "fr" ? "Chapitre" : "Chapter",
      title: locale === "fr" ? "Chaque activité, une à une" : "Every activity, one by one",
      body:
        locale === "fr"
          ? `${events.length} rendez-vous. Pas un résumé flou : date, lieu, format, et ce qui s’est vraiment passé.`
          : `${events.length} gatherings. Not a blur: date, place, format, and what actually happened.`,
    })

    chunk(events, 5).forEach((group, gi) => {
      slides.push({
        layout: "timeline",
        icon: iconFor("timeline"),
        kicker: locale === "fr" ? `Calendrier ${gi + 1}` : `Calendar ${gi + 1}`,
        title: locale === "fr" ? "Le fil des jours" : "The thread of days",
        items: group.map((e) => ({
          title: e.title,
          meta: `${fmtDay(e.startAt, locale)} · ${typeLabel(e.type, locale)} · ${e.venue || e.location || ""}`,
          text: e.summary || e.description || "",
          imageUrl: e.posterUrl || e.gallery[0],
        })),
      })
    })
  } else if (events.length === 1) {
    slides.push({
      layout: "chapter",
      icon: iconFor("chapter"),
      kicker: locale === "fr" ? "Le dernier rendez-vous" : "The last gathering",
      title: events[0].title,
      body: events[0].description || events[0].summary || eventBody(events[0], locale, briefLine),
      imageUrl: events[0].posterUrl || events[0].gallery[0] || cover || undefined,
      caption: fmtLong(events[0].startAt, locale),
    })
  }

  if (events.length) {

    events.forEach((event, i) => {
      slides.push({
        layout: "spotlight",
        icon: iconFor("spotlight", event.type),
        kicker: `${locale === "fr" ? "Activité" : "Activity"} ${i + 1} / ${events.length} · ${typeLabel(event.type, locale)}`,
        title: event.title,
        body: eventBody(event, locale, briefLine),
        imageUrl: event.posterUrl || event.gallery[0] || cover || undefined,
        metrics: [
          { label: locale === "fr" ? "inscrits" : "signed up", value: String(event.registrations) },
          { label: locale === "fr" ? "présences" : "in the room", value: String(event.attendances) },
        ],
        caption: [fmtLong(event.startAt, locale), event.venue || event.location, event.format].filter(Boolean).join(" · "),
        quote: quoteFor(event.type, locale, event.title, briefLine),
        quoteBy: event.title,
      })
    })
  }

  if (ctx.teams.length && !focused) {
    slides.push({
      layout: "split",
      icon: iconFor("split"),
      kicker: locale === "fr" ? "Les crews" : "The crews",
      title: locale === "fr" ? "Qui a porté la saison" : "Who carried the season",
      body:
        locale === "fr"
          ? "Un club tient par des équipes nommées, pas par un groupe WhatsApp anonyme."
          : "A club holds because crews have names — not because a chat stays noisy.",
      items: ctx.teams.map((team) => ({
        title: team.name,
        meta: `${team.members} ${locale === "fr" ? "membres" : "members"}`,
        text: team.purpose || undefined,
      })),
    })
  }

  if (ctx.proposals.length && !focused) {
    slides.push({
      layout: "split",
      icon: iconFor("split"),
      kicker: locale === "fr" ? "Idées" : "Ideas",
      title: locale === "fr" ? "Ce que les membres ont osé poser" : "What members dared to table",
      bullets: ctx.proposals.map((p) => `${p.title} · ${p.status}`),
    })
  }

  const galleryItems = focused
    ? (events[0].gallery || []).slice(0, 8).map((url) => ({
        title: events[0].title,
        text: fmtDay(events[0].startAt, locale),
        imageUrl: url,
      }))
    : ctx.posts.slice(0, 8).map((p) => ({
        title: p.title,
        text: p.content,
        imageUrl: p.imageUrl || undefined,
      }))
  if (galleryItems.length) {
    slides.push({
      layout: "gallery",
      icon: iconFor("gallery"),
      kicker: locale === "fr" ? "Mémoire visuelle" : "Visual memory",
      title: focused ? events[0].title : locale === "fr" ? "Ce qu’on a montré" : "What we showed",
      items: galleryItems,
    })
  }

  slides.push({
    layout: "quote",
    icon: iconFor("quote"),
    kicker: locale === "fr" ? "Pour la route" : "For the road",
    title: "",
    quote:
      locale === "fr"
        ? "Gardez les portes ouvertes. Le reste — les affiches, les chiffres, les nuits — n’est que la preuve."
        : "Keep the doors open. The rest — posters, numbers, nights — is only proof.",
    quoteBy: ctx.organization.name,
  })

  slides.push({
    layout: "closing",
    icon: iconFor("closing"),
    kicker: locale === "fr" ? "Merci" : "Thank you",
    title: locale === "fr" ? "Les portes restent ouvertes." : "The doors stay open.",
    body: [ctx.organization.website, loc, ctx.period.label].filter(Boolean).join(" · "),
    imageUrl: ctx.organization.logoUrl || cover || undefined,
  })

  return {
    title: headline,
    subtitle: briefLine.slice(0, 160) || (focused ? events[0].title : locale === "fr" ? "Une saison qu’on peut raconter" : "A season we can tell"),
    periodLabel: ctx.period.label,
    organizationName: ctx.organization.name,
    logoUrl: ctx.organization.logoUrl,
    coverUrl: ctx.organization.coverUrl,
    theme,
    locale,
    usedFallback: true,
    slides,
  }
}

export function applyVoice(deck: StoryDeck, voice: StoryVoice | null, brief: string): StoryDeck {
  if (!voice || voice.error) {
    return { ...deck, voiceNote: voice?.error || "Template + club facts (AI voice unavailable)", usedFallback: true }
  }

  const byTitle = new Map((voice.events || []).map((e) => [normTitle(e.title), e]))
  const findVoice = (title: string) => {
    const n = normTitle(title)
    if (byTitle.has(n)) return byTitle.get(n)
    for (const [k, v] of byTitle) {
      if (n.includes(k) || k.includes(n)) return v
    }
    return undefined
  }
  const slides = deck.slides.map((slide) => {
    if (slide.layout === "cover") {
      const aiTitle = voice.title && titleMatchesBrief(voice.title, brief) ? voice.title : slide.title
      return {
        ...slide,
        title: aiTitle,
        body: voice.coverBody || slide.body,
      }
    }
    if (slide.layout === "spotlight") {
      const hit = findVoice(slide.title)
      if (!hit) return slide
      return {
        ...slide,
        body: hit.body || slide.body,
        quote: hit.quote || slide.quote,
      }
    }
    return slide
  })

  return {
    ...deck,
    title: voice.title && titleMatchesBrief(voice.title, brief) ? voice.title : deck.slides[0]?.title || deck.title,
    subtitle: voice.subtitle || brief.slice(0, 160) || deck.subtitle,
    theme: pickTheme(`${deck.organizationName}|${brief}`, brief, voice.theme),
    usedFallback: false,
    voiceNote: `AI wrote the voice for this brief · ${slides.filter((s) => s.layout === "spotlight").length} activities`,
    slides,
  }
}

export function finalizeDeck(
  ctx: OrgActivityContext,
  brief: string,
  voice: StoryVoice | null,
  localeHint?: StoryLocale,
  themeLock?: string | null,
): StoryDeck {
  const local = composeFallbackDeck(ctx, brief, localeHint)
  const withVoice = applyVoice(local, voice, brief)
  const theme = pickTheme(`${ctx.organization.id}|${brief}|${ctx.period.label}`, brief, themeLock || withVoice.theme)
  return {
    ...withVoice,
    theme,
    periodLabel: ctx.period.label,
    organizationName: ctx.organization.name,
    logoUrl: ctx.organization.logoUrl,
    coverUrl: ctx.organization.coverUrl,
  }
}
