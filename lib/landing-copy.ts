import type { Locale } from "./brand"

type Room = { kicker: string; title: string; body: string; bullets: string[]; cta: string; href: string }

type L = {
  kicker: string
  heroBefore: string
  heroLine1: string
  heroLine2: string
  heroAccent: string
  heroAfter: string
  heroSub: string
  ctaPrimary: string
  ctaSecondary: string
  ctaWatch: string
  stats: { n: string; l: string }[]
  roomsKicker: string
  roomsTitle: string
  roomsAccent: string
  rooms: Room[]
  howKicker: string
  howTitle: string
  howAside: string[]
  howSteps: { t: string; d: string }[]
  mockBureau: string
  mockMember: string
  mockCaption: string
  featuresTitle: string
  features: { t: string; d: string }[]
  faqTitle: string
  faq: { q: string; a: string }[]
  closeTitle: string
  closeAccent: string
  closeSub: string
  footer: string
  manifesto: string
  clubsKicker: string
  clubsTitle: string
  clubsAccent: string
  clubsSub: string
  clubsSearch: string
  eventsKicker: string
  eventsTitle: string
  eventsAccent: string
  eventsSub: string
  eventsSearch: string
}

export const landingCopy: Record<Locale, L> = {
  en: {
    kicker: "Built for Tunisian youth first.",
    heroBefore: "Your next opportunity ",
    heroLine1: "Your next",
    heroLine2: "opportunity",
    heroAccent: "is a door,",
    heroAfter: "not a rumor.",
    heroSub:
      "Tafsula is where young people in Tunisia find clubs, events, and real work — then put that work on a profile that travels with them. Clubs are the houses. Youth are the reason the lights are on.",
    ctaPrimary: "Find your door",
    ctaSecondary: "I run a club",
    ctaWatch: "Watch how it works",
    stats: [
      { n: "Youth", l: "First audience, always" },
      { n: "Doors", l: "Not WhatsApp folklore" },
      { n: "Proof", l: "Hours you can show" },
      { n: "TN", l: "Made here, for here" },
    ],
    roomsKicker: "Who it is for",
    roomsTitle: "A square for you. ",
    roomsAccent: "A house for the club.",
    rooms: [
      {
        kicker: "You, 18–25, hungry",
        title: "Walk in looking for a chance",
        body: "Stop hunting ten WhatsApp groups. Discover a club, register for a night, join a team, finish something you can point to.",
        bullets: ["A public map of clubs & events", "Work that becomes points and proof", "A profile that shows what you actually did"],
        cta: "Start looking →",
        href: "/organizations",
      },
      {
        kicker: "Bureau",
        title: "Keep the door open",
        body: "Invite members. Publish events. Form teams. Answer ideas. Show the country the semester you built — so youth have somewhere real to land.",
        bullets: ["Members & invites in one house", "Events, teams, tasks, attendance", "News and ideas that don’t die in a scroll"],
        cta: "Open a house →",
        href: "/organizations/join",
      },
    ],
    howKicker: "How a door opens",
    howTitle: "Find it. Walk in. Do the work. Show it.",
    howAside: ["opportunity, not gossip", "one invitation", "the room fills", "proof you can carry"],
    howSteps: [
      { t: "Find the door", d: "Browse clubs and nights across Tunisia. See who is actually doing work this month." },
      { t: "Walk in", d: "Register. Get invited. Set a password. You’re in — no mystery Excel." },
      { t: "Do the work", d: "Join a team. Take a task. Welcome desk, logistics, comms — real hours, not likes." },
      { t: "Show it", d: "Points, events, ideas. Your profile becomes a trail of things you built." },
    ],
    mockBureau: "The house, for the bureau",
    mockMember: "The house, for you",
    mockCaption: "Same square. Two jobs. Youth at the center.",
    featuresTitle: "What you can actually do here",
    features: [
      { t: "Find clubs", d: "A living directory — not a PDF, not a rumor." },
      { t: "Catch events", d: "Workshops, hangouts, trainings. Register in one tap." },
      { t: "Join a team", d: "A team, a lead, a job to finish. Belonging with a task." },
      { t: "Earn proof", d: "Simple work. Bureau signs it. Effort becomes points." },
      { t: "Hear the club", d: "One news feed. People talking like people." },
      { t: "Send an idea", d: "Propose. Get an answer. Nothing dies in a scroll." },
      { t: "Carry a profile", d: "What you did this year, in one place you own." },
      { t: "FR · AR · EN", d: "The country speaks three ways. So do we." },
    ],
    faqTitle: "Straight answers",
    faq: [
      { q: "Is this for clubs or for youth?", a: "For youth first. Clubs are how opportunity becomes a room with a date. The product exists so a 20-year-old can find that room." },
      { q: "Is this a personality quiz?", a: "No. There is no test. Tafsula is a public square and a club house." },
      { q: "How do I find an opportunity?", a: "Browse clubs and events. Join, register, take a task. Your profile keeps the trail." },
      { q: "How does a club open a door?", a: "Request to be listed. An admin approves. The bureau invites members and publishes nights." },
      { q: "Is it free?", a: "Yes for this launch. Built so a campus club — and a student with no budget — can still walk in." },
      { q: "Which languages?", a: "French, Arabic, English. Arabic is right-to-left. Switch anytime." },
    ],
    closeTitle: "A generation is already working. ",
    closeAccent: "Give it a door.",
    closeSub: "Come looking for a chance. Or come ready to host one.",
    footer: "Made with care for Tunisian youth — and the houses that hold them.",
    manifesto:
      "Opportunity in Tunisia is too often a friend of a friend. Tafsula is a public square: you walk in looking for a team. A club walks in ready to host. You leave with a name, a date, and work you can show.",
    clubsKicker: "Doors, not directories",
    clubsTitle: "Clubs where ",
    clubsAccent: "opportunity lives.",
    clubsSub: "Every club here is a possible next chapter — a team, a night, a skill, a person who will remember your name.",
    clubsSearch: "Search a club, a city, a feeling…",
    eventsKicker: "Nights that count",
    eventsTitle: "Events you can ",
    eventsAccent: "actually walk into.",
    eventsSub: "Workshops, hangouts, trainings — the kind of evenings that quietly change a semester.",
    eventsSearch: "Search a night, a club, a skill…",
  },
  fr: {
    kicker: "D’abord pour la jeunesse tunisienne.",
    heroBefore: "Ta prochaine opportunité ",
    heroLine1: "Ta prochaine",
    heroLine2: "opportunité",
    heroAccent: "est une porte,",
    heroAfter: "pas une rumeur.",
    heroSub:
      "Tafsula, c’est là où la jeunesse trouve des clubs, des événements, du vrai travail — et pose ce travail sur un profil qui voyage avec elle. Les clubs sont les maisons. La jeunesse est la raison pour laquelle la lumière est allumée.",
    ctaPrimary: "Trouver ma porte",
    ctaSecondary: "Je tiens un club",
    ctaWatch: "Voir comment ça marche",
    stats: [
      { n: "Jeunesse", l: "Le public premier" },
      { n: "Portes", l: "Pas le folklore WhatsApp" },
      { n: "Preuve", l: "Des heures que tu montres" },
      { n: "TN", l: "Pensé ici, pour ici" },
    ],
    roomsKicker: "Pour qui",
    roomsTitle: "Une place pour toi. ",
    roomsAccent: "Une maison pour le club.",
    rooms: [
      {
        kicker: "Toi, 18–25 ans, faim de vrai",
        title: "Entrer pour une chance",
        body: "Arrête de chasser dix WhatsApp. Trouve un club, inscris-toi à une soirée, rejoins une équipe, finis quelque chose que tu peux montrer.",
        bullets: ["Une carte publique des clubs et des nuits", "Un travail qui devient des points et une preuve", "Un profil de ce que tu as vraiment fait"],
        cta: "Commencer à chercher →",
        href: "/organizations",
      },
      {
        kicker: "Bureau",
        title: "Tenir la porte ouverte",
        body: "Invite. Publie. Forme des équipes. Réponds aux idées. Montre le semestre — pour que la jeunesse ait où atterrir.",
        bullets: ["Membres et invitations", "Événements, équipes, tâches, présence", "Une actu qui ne meurt pas dans le scroll"],
        cta: "Ouvrir une maison →",
        href: "/organizations/join",
      },
    ],
    howKicker: "Comment une porte s’ouvre",
    howTitle: "Trouve. Entre. Fais. Montre.",
    howAside: ["l’opportunité, pas le gossip", "une invitation", "la salle se remplit", "une preuve que tu emportes"],
    howSteps: [
      { t: "Trouve la porte", d: "Parcours les clubs et les nuits. Vois qui fait vraiment du travail ce mois-ci." },
      { t: "Entre", d: "Inscris-toi. Reçois l’invitation. Choisis un mot de passe. Tu es dedans." },
      { t: "Fais le travail", d: "Une équipe, une tâche. Accueil, logistique, comm — des heures vraies, pas des likes." },
      { t: "Montre-le", d: "Points, événements, idées. Ton profil devient la trace de ce que tu as construit." },
    ],
    mockBureau: "La maison, pour le bureau",
    mockMember: "La maison, pour toi",
    mockCaption: "La même place. Deux métiers. La jeunesse au centre.",
    featuresTitle: "Ce que tu peux vraiment faire ici",
    features: [
      { t: "Trouver un club", d: "Un annuaire vivant — pas un PDF, pas une rumeur." },
      { t: "Attraper une nuit", d: "Ateliers, sorties, formations. Inscription en un tap." },
      { t: "Rejoindre une équipe", d: "Un chef, un job, un sentiment d’appartenir." },
      { t: "Gagner une preuve", d: "Travail simple. Le bureau signe. L’effort devient des points." },
      { t: "Entendre le club", d: "Un fil d’actu. Des gens qui parlent comme des gens." },
      { t: "Envoyer une idée", d: "Propose. Reçois une réponse." },
      { t: "Porter un profil", d: "Ce que tu as fait cette année, à toi." },
      { t: "FR · AR · EN", d: "Le pays parle trois langues. Nous aussi." },
    ],
    faqTitle: "Réponses nettes",
    faq: [
      { q: "C’est pour les clubs ou pour la jeunesse ?", a: "Pour la jeunesse d’abord. Les clubs sont la pièce avec une date. Le produit existe pour qu’un·e jeune de 20 ans trouve cette pièce." },
      { q: "C’est un test de personnalité ?", a: "Non. Tafsula est une place publique et une maison de club." },
      { q: "Comment je trouve une opportunité ?", a: "Parcours clubs et événements. Rejoins, inscris-toi, prends une tâche. Ton profil garde la trace." },
      { q: "Et un club ?", a: "Demande d’inscription. Un admin approuve. Le bureau invite et publie." },
      { q: "C’est gratuit ?", a: "Oui pour ce lancement. Pensé pour un club de campus — et un étudiant sans budget." },
      { q: "Langues ?", a: "Français, arabe, anglais. L’arabe est RTL." },
    ],
    closeTitle: "Une génération travaille déjà. ",
    closeAccent: "Donne-lui une porte.",
    closeSub: "Viens chercher une chance. Ou viens en ouvrir une.",
    footer: "Fait avec soin pour la jeunesse tunisienne — et les maisons qui la portent.",
    manifesto:
      "En Tunisie, l’opportunité est trop souvent un ami d’un ami. Tafsula est une place : tu entres pour une équipe. Un club entre pour accueillir. Tu ressors avec un nom, une date, et un travail à montrer.",
    clubsKicker: "Des portes, pas un annuaire",
    clubsTitle: "Des clubs où ",
    clubsAccent: "l’opportunité habite.",
    clubsSub: "Chaque club ici est un chapitre possible — une équipe, une nuit, une compétence, quelqu’un qui retiendra ton nom.",
    clubsSearch: "Cherche un club, une ville, une envie…",
    eventsKicker: "Des nuits qui comptent",
    eventsTitle: "Des événements où ",
    eventsAccent: "tu entres vraiment.",
    eventsSub: "Ateliers, sorties, formations — les soirées qui changent un semestre, tout doucement.",
    eventsSearch: "Cherche une nuit, un club, un skill…",
  },
  ar: {
    kicker: "أولًا لشباب تونس.",
    heroBefore: "فرصتك التالية ",
    heroLine1: "فرصتك",
    heroLine2: "التالية",
    heroAccent: "باب،",
    heroAfter: "وليست إشاعة.",
    heroSub:
      "تفسولة حيث يجد الشباب نوادي وفعاليات وعملًا حقيقيًا — ثم يضعون هذا العمل في ملف يسافر معهم. النوادي بيوت. الشباب سبب إضاءة الأنوار.",
    ctaPrimary: "اعثر على بابك",
    ctaSecondary: "أدير ناديًا",
    ctaWatch: "شاهد كيف يعمل",
    stats: [
      { n: "شباب", l: "الجمهور الأول" },
      { n: "أبواب", l: "ليست إشاعات واتساب" },
      { n: "أثر", l: "ساعات تأخذها معك" },
      { n: "TN", l: "صُنع هنا، من أجل هنا" },
    ],
    roomsKicker: "لمن",
    roomsTitle: "ساحة لك. ",
    roomsAccent: "وبيت للنادي.",
    rooms: [
      {
        kicker: "أنت، ١٨–٢٥، جائع لعمل حقيقي",
        title: "ادخل تبحث عن فرصة",
        body: "كفّ عن مطاردة عشر مجموعات واتساب. اكتشف ناديًا، سجّل في ليلة، انضم لفريق، أنجز ما تستطيع الإشارة إليه.",
        bullets: ["خريطة عامة للنوادي والليالي", "عمل يصبح نقاطًا وبرهانًا", "ملف بما فعلت فعلًا"],
        cta: "ابدأ البحث ←",
        href: "/organizations",
      },
      {
        kicker: "المكتب",
        title: "أبقِ الباب مفتوحًا",
        body: "ادعُ. انشر. شكّل فرقًا. أجب عن الأفكار. أظهر الفصل — ليجد الشباب أين يحطّون.",
        bullets: ["أعضاء ودعوات", "فعاليات وفرق ومهام وحضور", "أخبار لا تموت في التمرير"],
        cta: "افتح بيتًا ←",
        href: "/organizations/join",
      },
    ],
    howKicker: "كيف يُفتح باب",
    howTitle: "اعثر. ادخل. اعمل. أظهر.",
    howAside: ["فرصة لا إشاعة", "دعوة واحدة", "القاعة تمتلئ", "برهان تحمله"],
    howSteps: [
      { t: "اعثر على الباب", d: "تصفّح النوادي والليالي. انظر من يعمل هذا الشهر." },
      { t: "ادخل", d: "سجّل. تلقى دعوة. ضع كلمة مرور. أنت داخل." },
      { t: "اعمل", d: "فريق ومهمة. استقبال، لوجستيك، تواصل — ساعات حقيقية." },
      { t: "أظهر", d: "نقاط وفعاليات وأفكار. ملفك أثر ما بنيت." },
    ],
    mockBureau: "البيت، للمكتب",
    mockMember: "البيت، لك",
    mockCaption: "ساحة واحدة. عملان. الشباب في المركز.",
    featuresTitle: "ما يمكنك فعله هنا",
    features: [
      { t: "اعثر على نادٍ", d: "دليل حي — لا ملف PDF ولا إشاعة." },
      { t: "أمسك ليلة", d: "ورش ولقاءات وتدريبات." },
      { t: "انضم لفريق", d: "قائد وعمل وانتماء." },
      { t: "اكسب برهانًا", d: "عمل بسيط. المكتب يوقع. الجهد نقاط." },
      { t: "اسمع النادي", d: "خيط أخبار واحد." },
      { t: "أرسل فكرة", d: "اقترح. خذ جوابًا." },
      { t: "احمل ملفًا", d: "ما فعلته هذه السنة، لك." },
      { t: "ع · ف · E", d: "البلاد بثلاث لغات. نحن كذلك." },
    ],
    faqTitle: "أجوبة مباشرة",
    faq: [
      { q: "للنوادي أم للشباب؟", a: "للشباب أولًا. النوادي هي الغرفة ذات التاريخ. المنتج موجود ليجد شاب في العشرين هذه الغرفة." },
      { q: "هل هذا اختبار شخصية؟", a: "لا. تفسولة ساحة عامة وبيت نادٍ." },
      { q: "كيف أجد فرصة؟", a: "تصفّح النوادي والفعاليات. انضم، سجّل، خذ مهمة." },
      { q: "والنادي؟", a: "طلب إدراج. موافقة المشرف. المكتب يدعو وينشر." },
      { q: "هل هو مجاني؟", a: "نعم في هذا الإطلاق." },
      { q: "اللغات؟", a: "فرنسية وعربية وإنجليزية. العربية من اليمين." },
    ],
    closeTitle: "جيل يعمل أصلًا. ",
    closeAccent: "أعطه بابًا.",
    closeSub: "تعال تبحث عن فرصة. أو تعال تفتح واحدة.",
    footer: "صُنع بعناية لشباب تونس — والبيوت التي تحملهم.",
    manifesto:
      "الفرصة في تونس غالبًا صديق صديق. تفسولة ساحة: تدخل بحثًا عن فريق. النادي يدخل ليستقبل. تخرج باسم وتاريخ وعمل تُظهره.",
    clubsKicker: "أبواب، لا دليل بارد",
    clubsTitle: "نوادٍ تسكن فيها ",
    clubsAccent: "الفرصة.",
    clubsSub: "كل نادٍ هنا فصل ممكن — فريق، ليلة، مهارة، شخص سيتذكّر اسمك.",
    clubsSearch: "ابحث عن نادٍ، مدينة، إحساس…",
    eventsKicker: "ليالٍ تُحسب",
    eventsTitle: "فعاليات ",
    eventsAccent: "تدخلها فعلًا.",
    eventsSub: "ورش ولقاءات وتدريبات — أمسيات تغيّر فصلًا بهدوء.",
    eventsSearch: "ابحث عن ليلة، نادٍ، مهارة…",
  },
}
