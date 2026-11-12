const { loadEnvConfig } = require("@next/env")
const { PrismaClient } = require("@prisma/client")
const { hash } = require("bcryptjs")
const { randomBytes } = require("node:crypto")
const { appendFile, readFile } = require("node:fs/promises")
const path = require("node:path")

loadEnvConfig(process.cwd())

const prisma = new PrismaClient()
const ORG = "demo-organization-20261030"
const HR = "demo-hr-20261030"
const PREFIX = "demo-rich-"
const projectRef = "qzrxeytutiwizzlhybgq"

const U = (id, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const IMG = {
  cover: U("photo-1489749798305-4fea3ae63d43"),
  logo: U("photo-1529156069898-49953e39b3ac", 600),
  night: U("photo-1492684223066-81342ee5ff30"),
  workshop: U("photo-1540575467063-178a50c2df87"),
  photo: U("photo-1452587925148-ce544e77e70d"),
  volunteer: U("photo-1559027615-cd4628902d4a"),
  music: U("photo-1511671782779-c97d3d27a1d4"),
  team: U("photo-1522071820081-009f0129c71c"),
  hackathon: U("photo-1504384308090-c894fdcc538d"),
  cafe: U("photo-1517248135467-4c7edcad34c4"),
  stage: U("photo-1470229722913-7c0e2dbbafd3"),
  design: U("photo-1558655146-9f40138edfeb"),
  outdoors: U("photo-1469474968028-56623f02e42e"),
  crowd: U("photo-1429962714451-bb93442cfd66"),
  talk: U("photo-1475721027785-f74eccf877e2"),
  street: U("photo-1558618666-fcd25c85cd64"),
  studio: U("photo-1598488035139-bdbb2231ce04"),
  food: U("photo-1414235077428-338989a2e8c0"),
  campus: U("photo-1541339902985-4bf4f4daab1d"),
  lights: U("photo-1514525253161-7a46d19cd819"),
}

const EXTRA_MEMBERS = [
  ["Yasmine Ben Ali", "Media"],
  ["Omar Trabelsi", "Events"],
  ["Sarra Mansouri", "Design"],
  ["Mehdi Kacem", "Dev"],
  ["Ines Gharbi", "Partnerships"],
  ["Aymen Jebali", "Welcome desk"],
  ["Nour El Houda", "Photo"],
  ["Karim Bouazizi", "Sound"],
  ["Lina Cherif", "Writing"],
  ["Hamza Riahi", "Logistics"],
  ["Amira Saidi", "Social"],
  ["Bilel Hamdi", "Video"],
  ["Fatma Zouari", "HR support"],
  ["Youssef Dridi", "Tech"],
  ["Hiba Mejri", "Illustration"],
  ["Anis Lahmar", "Stage"],
  ["Mariem Ayari", "Community"],
  ["Sami Bouzid", "Finance"],
  ["Rim Khelifi", "Workshops"],
  ["Khaled Masmoudi", "Security"],
  ["Aya Ferjani", "Content"],
  ["Walid Chaabane", "Partnerships"],
  ["Salma Jaziri", "Design"],
  ["Tarek Nouira", "Dev"],
  ["Eya Mabrouk", "Events"],
  ["Rami Sghaier", "Photo"],
  ["Donia Ben Romdhane", "Media"],
]

function assertTargetDatabase() {
  for (const variable of ["DATABASE_URL", "DIRECT_URL"]) {
    if (!process.env[variable]) throw new Error(`${variable} is missing`)
  }
  const applicationUrl = new URL(process.env.DATABASE_URL)
  const migrationUrl = new URL(process.env.DIRECT_URL)
  const isSupabase = (h) => h.endsWith(".supabase.com") || h.endsWith(".supabase.co")
  const identifies = [applicationUrl, migrationUrl].some(
    (url) => url.hostname.includes(projectRef) || decodeURIComponent(url.username).includes(projectRef),
  )
  if (!isSupabase(applicationUrl.hostname) || !isSupabase(migrationUrl.hostname) || !identifies) {
    throw new Error("Refusing to seed: database is not the confirmed demo Supabase project")
  }
}

function at(y, m, d, h = 18) {
  return new Date(Date.UTC(y, m - 1, d, h, 0, 0))
}

async function wipeRich() {
  await prisma.teamTaskAssignment.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.teamTaskComment.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.teamTask.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.eventFeedback.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.eventAttendance.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.eventRegistration.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.eventQRCode.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.eventDirector.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.event.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.postLike.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.postComment.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.notification.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.organizationPost.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.proposalComment.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.proposal.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.task.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.resource.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.projectDirector.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.teamDirector.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.teamMember.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.team.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.project.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.certificate.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.userSkill.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.memberCredit.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await prisma.userEventStats.deleteMany({ where: { id: { startsWith: PREFIX } } })
}

async function main() {
  assertTargetDatabase()
  const org = await prisma.organization.findUnique({ where: { id: ORG } })
  if (!org) throw new Error("Demo organization missing. Run the original demo seed first.")
  const hr = await prisma.user.findUnique({ where: { id: HR } })
  if (!hr) throw new Error("Demo HR user missing.")

  console.log("Filling Tafsula Demo Team with rich mock data…")
  await wipeRich()

  const now = new Date()
  const extraPassword = process.env.SEED_MEMBER_PASSWORD || randomBytes(18).toString("base64url")
  const extraHash = await hash(extraPassword, 10)

  const extraUsers = EXTRA_MEMBERS.map((row, i) => {
    const n = String(i + 1).padStart(2, "0")
    const slug = row[0].toLowerCase().replace(/[^a-z]+/g, ".")
    return {
      id: `${PREFIX}user-${n}`,
      email: `${slug}.${n}@tafsula.example`,
      name: row[0],
      roleTitle: row[1],
      avatarId: (i % 4) + 1,
    }
  })

  for (const user of extraUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: "MEMBER",
        organizationId: ORG,
        memberStatus: "ACCEPTED",
        avatarId: user.avatarId,
        invitedById: HR,
        updatedAt: now,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: extraHash,
        role: "MEMBER",
        avatarId: user.avatarId,
        organizationId: ORG,
        invitedById: HR,
        memberStatus: "ACCEPTED",
        createdAt: now,
        updatedAt: now,
      },
    })
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        headline: `${user.roleTitle} at the club`,
        roleTitle: user.roleTitle,
        location: "Tunis",
        bio: `${user.name} is a fictional club member used for Story Studio and dashboard demos.`,
        skillsJson: [user.roleTitle, "Teamwork", "Arabic", "French"],
        updatedAt: now,
      },
      create: {
        userId: user.id,
        headline: `${user.roleTitle} at the club`,
        roleTitle: user.roleTitle,
        location: "Tunis",
        bio: `${user.name} is a fictional club member used for Story Studio and dashboard demos.`,
        skillsJson: [user.roleTitle, "Teamwork", "Arabic", "French"],
        createdAt: now,
        updatedAt: now,
      },
    })
  }

  const dbMembers = await prisma.user.findMany({
    where: { organizationId: ORG, role: "MEMBER" },
    select: { id: true, name: true },
  })
  const allPeople = [{ id: HR, name: hr.name }, ...dbMembers]
  const memberIds = dbMembers.map((u) => u.id)

  await prisma.organization.update({
    where: { id: ORG },
    data: { name: "Tafsula Demo Team", updatedAt: now },
  })

  await prisma.organizationProfile.upsert({
    where: { organizationId: ORG },
    update: {
      profileImageUrl: IMG.logo,
      coverImageUrl: IMG.cover,
      bio: "A youth club house in Tunis: open nights, crews, real tasks, and a trail you can show. This demo season is packed so Story Studio has something to film.",
      contactEmail: "demo.hr@tafsula.example",
      contactPhone: "+216 20 000 000",
      location: "Medina of Tunis",
      website: "https://tafsula.example",
      galleryImagesJson: [IMG.night, IMG.workshop, IMG.photo, IMG.volunteer, IMG.music, IMG.team, IMG.hackathon, IMG.stage],
      isPublic: true,
      updatedAt: now,
    },
    create: {
      organizationId: ORG,
      profileImageUrl: IMG.logo,
      coverImageUrl: IMG.cover,
      bio: "A youth club house in Tunis: open nights, crews, real tasks, and a trail you can show.",
      contactEmail: "demo.hr@tafsula.example",
      location: "Medina of Tunis",
      website: "https://tafsula.example",
      galleryImagesJson: [IMG.night, IMG.workshop, IMG.photo, IMG.stage],
      isPublic: true,
      updatedAt: now,
    },
  })

  for (const person of allPeople) {
    await prisma.organizationMembership.upsert({
      where: { userId_organizationId: { userId: person.id, organizationId: ORG } },
      update: { status: "ACCEPTED", role: person.id === HR ? "HR" : "MEMBER" },
      create: {
        id: `${PREFIX}mem-${person.id.slice(-12)}`,
        userId: person.id,
        organizationId: ORG,
        role: person.id === HR ? "HR" : "MEMBER",
        status: "ACCEPTED",
        answersJson: { via: "rich_seed" },
        createdAt: at(2026, 1, 8 + (person.id.length % 20)),
        updatedAt: now,
      },
    })
  }

  const skillNames = [
    "Photography",
    "Video",
    "Graphic design",
    "Public speaking",
    "Python",
    "Event production",
    "Arabic writing",
    "Project management",
  ]
  for (const name of skillNames) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name, category: "club", updatedAt: now },
    })
  }
  const skills = await prisma.skill.findMany({ where: { name: { in: skillNames } } })
  let skillRow = 0
  for (const member of dbMembers) {
    for (let k = 0; k < 3; k++) {
      const skill = skills[(skillRow + k) % skills.length]
      await prisma.userSkill.upsert({
        where: { userId_skillId: { userId: member.id, skillId: skill.id } },
        update: { level: 2 + (k % 3) },
        create: {
          id: `${PREFIX}uskill-${skillRow}-${k}`,
          userId: member.id,
          skillId: skill.id,
          level: 2 + (k % 3),
        },
      })
    }
    skillRow++
  }

  const projects = [
    ["season", "Season 2026 house", "The year-long operating project for nights, crews, and proof."],
    ["nights", "Open nights circuit", "Public evenings in the medina and on campus."],
    ["digital", "Digital house", "Site, archive, and Story Studio assets."],
  ]
  for (const [key, title, description] of projects) {
    await prisma.project.create({
      data: {
        id: `${PREFIX}project-${key}`,
        organizationId: ORG,
        title,
        description,
        type: "internal",
        status: "in-progress",
        visibility: "ORG",
        createdById: HR,
        timelineStart: at(2026, 1, 10, 10),
        timelineEnd: at(2026, 12, 15, 18),
        createdAt: at(2026, 1, 10, 10),
        updatedAt: now,
      },
    })
  }

  const teams = [
    ["media", "Media crew", "Photo, video, recaps", "season"],
    ["events", "Events crew", "Doors, guests, run-of-show", "nights"],
    ["design", "Design crew", "Posters, identity, slides", "digital"],
    ["dev", "Digital crew", "Site and tools", "digital"],
    ["partners", "Partnerships", "Sponsors and campus doors", "season"],
    ["welcome", "Welcome desk", "First contact on the night", "nights"],
  ]
  for (const [key, name, purpose, projectKey] of teams) {
    await prisma.team.create({
      data: {
        id: `${PREFIX}team-${key}`,
        organizationId: ORG,
        name,
        purpose,
        description: purpose,
        status: "active",
        visibility: "ORG",
        createdById: HR,
        projectId: `${PREFIX}project-${projectKey}`,
        createdAt: at(2026, 1, 12, 10),
        updatedAt: now,
      },
    })
  }

  const teamKeys = teams.map((t) => t[0])
  let tm = 0
  for (const member of dbMembers) {
    const teamKey = teamKeys[tm % teamKeys.length]
    await prisma.teamMember.create({
      data: {
        id: `${PREFIX}tm-${tm}`,
        teamId: `${PREFIX}team-${teamKey}`,
        userId: member.id,
        roleInTeam: tm % 6 === 0 ? "Lead" : "Member",
        status: "ACCEPTED",
        createdAt: at(2026, 1, 14, 12),
      },
    })
    tm++
  }

  await prisma.teamDirector.createMany({
    data: teamKeys.map((key, i) => ({
      id: `${PREFIX}tdir-${key}`,
      teamId: `${PREFIX}team-${key}`,
      userId: memberIds[i % memberIds.length],
      role: "DIRECTOR",
      createdAt: now,
      updatedAt: now,
    })),
    skipDuplicates: true,
  })

  const taskTitles = [
    "Lock the venue",
    "Print badges",
    "Cut the recap",
    "Write the caption",
    "Call the guest",
    "Test the sound",
    "Design the poster",
    "Upload the gallery",
    "Brief the welcome desk",
    "Collect feedback",
    "Buy water and tape",
    "Publish the night recap",
  ]
  const teamTaskRows = []
  let tt = 0
  for (const key of teamKeys) {
    for (let n = 0; n < 8; n++) {
      const status = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"][n % 4]
      teamTaskRows.push({
        id: `${PREFIX}tt-${tt}`,
        teamId: `${PREFIX}team-${key}`,
        title: `${taskTitles[n % taskTitles.length]} · ${key}`,
        description: "Fictional club work so dashboards and Story Studio have a trail.",
        status,
        taskStatus: status === "COMPLETED" ? "FINALIZED" : n % 2 ? "ACTIVE" : "PENDING",
        priority: ["LOW", "MEDIUM", "HIGH", "URGENT"][n % 4],
        createdById: HR,
        dueDate: at(2026, 2 + (n % 8), 5 + n, 18),
        createdAt: at(2026, 1, 20 + n, 11),
        updatedAt: now,
      })
      tt++
    }
  }
  await prisma.teamTask.createMany({ data: teamTaskRows })

  const assignments = []
  for (let i = 0; i < teamTaskRows.length; i++) {
    const userId = memberIds[i % memberIds.length]
    assignments.push({
      id: `${PREFIX}tta-${i}`,
      taskId: teamTaskRows[i].id,
      teamMemberId: `${PREFIX}tm-${i % dbMembers.length}`,
      userId,
      status: i % 3 === 0 ? "APPROVED" : i % 3 === 1 ? "SUBMITTED" : "IN_PROGRESS",
      approvalStatus: i % 3 === 0 ? "APPROVED" : "PENDING",
      acceptanceStatus: "ACCEPTED",
      creditsAwarded: i % 3 === 0 ? 8 : 0,
      createdAt: now,
      updatedAt: now,
    })
  }
  await prisma.teamTaskAssignment.createMany({ data: assignments })

  const projectTasks = []
  let pt = 0
  for (const [key] of projects) {
    for (let n = 0; n < 10; n++) {
      projectTasks.push({
        id: `${PREFIX}pt-${pt}`,
        projectId: `${PREFIX}project-${key}`,
        title: `${taskTitles[n % taskTitles.length]} (${key})`,
        description: "Project-level work for the demo season.",
        status: ["todo", "in-progress", "done"][n % 3],
        taskStatus: n % 3 === 2 ? "FINALIZED" : "ACTIVE",
        priority: ["low", "medium", "high"][n % 3],
        assigneeId: memberIds[pt % memberIds.length],
        createdById: HR,
        dueDate: at(2026, 3 + (n % 6), 8, 17),
        createdAt: at(2026, 2, 1 + n, 10),
        updatedAt: now,
      })
      pt++
    }
  }
  await prisma.task.createMany({ data: projectTasks })

  const events = [
    ["orientation", "Season kickoff · doors open", IMG.campus, at(2026, 1, 18), "GENERAL"],
    ["photowalk", "Medina photo walk", IMG.photo, at(2026, 2, 14), "WORKSHOP"],
    ["women", "Women who run rooms", IMG.talk, at(2026, 3, 8), "CONFERENCE"],
    ["hack", "48h house hackathon", IMG.hackathon, at(2026, 3, 22, 9), "TRAINING"],
    ["opennight", "Open night · April", IMG.night, at(2026, 4, 19), "GENERAL"],
    ["poster", "Poster lab with Design crew", IMG.design, at(2026, 5, 3), "WORKSHOP"],
    ["give", "Volunteer morning · Bab Bhar", IMG.volunteer, at(2026, 5, 24, 9), "GENERAL"],
    ["concert", "Courtyard session", IMG.music, at(2026, 6, 7), "GENERAL"],
    ["rentree", "Rentrée night", IMG.lights, at(2026, 9, 12), "GENERAL"],
    ["career", "Career doors · partners", IMG.talk, at(2026, 10, 4), "CONFERENCE"],
    ["studio", "Recap studio day", IMG.studio, at(2026, 10, 25, 11), "WORKSHOP"],
    ["november", "November open house", IMG.crowd, at(2026, 11, 2), "GENERAL"],
  ]

  for (const [key, title, poster, start, type] of events) {
    const end = new Date(start.getTime() + 3 * 3600 * 1000)
    const past = start < now
    await prisma.event.create({
      data: {
        id: `${PREFIX}event-${key}`,
        organizationId: ORG,
        title,
        description: `${title} — a packed fictional night so the club recap has scenes, numbers, and pictures.`,
        type,
        format: "IN_PERSON",
        visibility: "PUBLIC",
        status: past ? "COMPLETED" : "UPCOMING",
        startAt: start,
        endAt: end,
        location: "Tunis",
        venue: "Tafsula house · Medina",
        posterUrl: poster,
        galleryImagesJson: [poster, IMG.crowd, IMG.team, IMG.stage],
        summary: past
          ? "Room full, doors held, recap shot. Fictional attendance for the demo season."
          : "On the calendar. Bring a crew.",
        tags: [type.toLowerCase(), "tunis", "youth"],
        createdById: HR,
        createdAt: start,
        updatedAt: now,
      },
    })
    await prisma.eventQRCode.create({
      data: {
        id: `${PREFIX}qr-${key}`,
        eventId: `${PREFIX}event-${key}`,
        code: `${PREFIX}qrcode-${key}`,
        totalScans: past ? 40 + (key.length % 30) : 0,
        createdAt: start,
      },
    })
    await prisma.eventDirector.create({
      data: {
        id: `${PREFIX}edir-${key}`,
        eventId: `${PREFIX}event-${key}`,
        userId: memberIds[key.length % memberIds.length],
        role: "DIRECTOR",
        createdAt: now,
        updatedAt: now,
      },
    })
  }

  const regs = []
  const atts = []
  const fbs = []
  let ri = 0
  for (const [key, , , start] of events) {
    const past = start < now
    const take = Math.min(memberIds.length, 18 + (ri % 8))
    for (let i = 0; i < take; i++) {
      const userId = memberIds[(ri + i) % memberIds.length]
      regs.push({
        id: `${PREFIX}reg-${key}-${i}`,
        eventId: `${PREFIX}event-${key}`,
        userId,
        status: "APPROVED",
        paymentStatus: "PAID",
        appliedAt: new Date(start.getTime() - 5 * 86400000),
        updatedAt: now,
      })
      if (past && i < take - 3) {
        atts.push({
          id: `${PREFIX}att-${key}-${i}`,
          eventId: `${PREFIX}event-${key}`,
          userId,
          status: "ATTENDED",
          checkInTime: start,
          scannedAt: start,
          pointsAwarded: 5,
          durationMinutes: 120,
          createdAt: start,
          updatedAt: now,
        })
      }
      if (past && i < 8) {
        fbs.push({
          id: `${PREFIX}fb-${key}-${i}`,
          eventId: `${PREFIX}event-${key}`,
          userId,
          rating: 4 + (i % 2),
          comment: "Fictional feedback: the room felt like a real house.",
          createdAt: new Date(start.getTime() + 86400000),
          updatedAt: now,
        })
      }
    }
    ri++
  }
  await prisma.eventRegistration.createMany({ data: regs, skipDuplicates: true })
  await prisma.eventAttendance.createMany({ data: atts, skipDuplicates: true })
  await prisma.eventFeedback.createMany({ data: fbs, skipDuplicates: true })

  const posts = [
    ["Doors we held in April", IMG.night],
    ["Photo walk contact sheets", IMG.photo],
    ["Hackathon at sunrise", IMG.hackathon],
    ["Design crew posters", IMG.design],
    ["Volunteer morning", IMG.volunteer],
    ["Courtyard session", IMG.music],
    ["Welcome desk faces", IMG.team],
    ["Career night notes", IMG.talk],
    ["Studio day stills", IMG.studio],
    ["Medina after rain", IMG.street],
    ["Campus kickoff", IMG.campus],
    ["Table reserved", IMG.cafe],
    ["Lights on", IMG.lights],
    ["Food for the crew", IMG.food],
    ["Outdoors briefing", IMG.outdoors],
  ]
  for (let i = 0; i < posts.length; i++) {
    const [title, imageUrl] = posts[i]
    const authorId = memberIds[i % memberIds.length]
    await prisma.organizationPost.create({
      data: {
        id: `${PREFIX}post-${i}`,
        organizationId: ORG,
        title,
        content: `${title}. A fictional recap paragraph for the demo club — enough texture for Story Studio and the public feed.`,
        imageUrl,
        authorId,
        status: "approved",
        approvalStatus: "approved",
        approvedById: HR,
        createdAt: at(2026, 1 + (i % 10), 4 + i, 16),
        updatedAt: now,
      },
    })
  }

  const ideas = [
    ["Night archive wall", "culture"],
    ["Partner breakfast", "partnership"],
    ["Member radio hour", "media"],
    ["Skill stamps", "training"],
    ["Open-source door kit", "tech"],
    ["Summer residency", "season"],
    ["Quiet room for exams", "campus"],
    ["Alumni table once a month", "community"],
  ]
  for (let i = 0; i < ideas.length; i++) {
    await prisma.proposal.create({
      data: {
        id: `${PREFIX}prop-${i}`,
        organizationId: ORG,
        type: ideas[i][1],
        title: ideas[i][0],
        status: ["submitted", "approved", "approved", "submitted"][i % 4],
        visibility: "ORG",
        submittedById: memberIds[i % memberIds.length],
        reviewerId: HR,
        canvasJson: {
          swot: {
            strengths: "Crew already in the room",
            weaknesses: "Need a clearer owner",
            opportunities: "Partners keep asking for proof",
            threats: "WhatsApp as the only archive",
          },
          smart: {
            specific: ideas[i][0],
            measurable: "One public artifact",
            achievable: "One crew, four weeks",
            relevant: "Club house, not folklore",
            timeBound: "This season",
          },
        },
        expectedImpact: "Makes the club readable from the outside.",
        createdAt: at(2026, 2 + (i % 8), 6, 12),
        updatedAt: now,
      },
    })
  }

  await prisma.resource.createMany({
    data: [
      ["brand", "Brand kit", IMG.design],
      ["run", "Run of show template", IMG.workshop],
      ["photo", "Photo archive 2026", IMG.photo],
      ["press", "Press one-pager", IMG.talk],
      ["budget", "Night budget sheet", IMG.cafe],
      ["safety", "Door protocol", IMG.crowd],
      ["story", "Story Studio brief", IMG.stage],
      ["onboard", "New member leaflet", IMG.campus],
    ].map(([key, title, url], i) => ({
      id: `${PREFIX}res-${key}`,
      organizationId: ORG,
      title,
      type: "link",
      url,
      description: "Fictional resource for the demo club.",
      createdById: HR,
      createdAt: at(2026, 1, 15 + i, 10),
      updatedAt: now,
    })),
  })

  for (let i = 0; i < Math.min(12, dbMembers.length); i++) {
    await prisma.certificate.create({
      data: {
        id: `${PREFIX}cert-${i}`,
        userId: memberIds[i],
        title: i % 2 ? "Crew lead · Season 2026" : "Open night production",
        issuer: "Tafsula Demo Team",
        issuedAt: at(2026, 6, 15),
        fileUrl: IMG.stage,
        skillsJson: ["Events", "Teamwork"],
        createdAt: now,
        updatedAt: now,
      },
    })
  }

  for (const member of dbMembers) {
    await prisma.memberCredit.upsert({
      where: { userId_organizationId: { userId: member.id, organizationId: ORG } },
      update: {
        totalCredits: 20 + (member.id.length % 40),
        tasksCompleted: 4,
        tasksApproved: 3,
      },
      create: {
        id: `${PREFIX}cred-${member.id.slice(-10)}`,
        userId: member.id,
        organizationId: ORG,
        totalCredits: 20 + (member.id.length % 40),
        tasksCompleted: 4,
        tasksApproved: 3,
        updatedAt: now,
      },
    })
    await prisma.userEventStats.upsert({
      where: { userId_organizationId: { userId: member.id, organizationId: ORG } },
      update: { totalEventsJoined: 8, totalAttended: 6, totalHoursAttended: 18 },
      create: {
        id: `${PREFIX}stats-${member.id.slice(-10)}`,
        userId: member.id,
        organizationId: ORG,
        totalEventsJoined: 8,
        totalAttended: 6,
        totalHoursAttended: 18,
        updatedAt: now,
      },
    })
  }

  const credPath = path.join(process.cwd(), "credentials.md")
  try {
    const current = await readFile(credPath, "utf8")
    if (!current.includes("Extra demo members")) {
      await appendFile(
        credPath,
        `\n## Extra demo members (${extraUsers.length})\nShared password for newly seeded members: \`${extraPassword}\`\nEmails look like \`yasmine.ben.ali.01@tafsula.example\`.\n`,
      )
    }
  } catch {
    /* credentials file is optional */
  }

  const memberCount = await prisma.user.count({ where: { organizationId: ORG, role: "MEMBER" } })
  const eventCount = await prisma.event.count({ where: { organizationId: ORG } })
  const postCount = await prisma.organizationPost.count({ where: { organizationId: ORG } })
  const taskCount = await prisma.teamTask.count({ where: { team: { organizationId: ORG } } })

  console.log(
    `Done. Members=${memberCount} events=${eventCount} posts=${postCount} teamTasks=${taskCount}`,
  )
  console.log("Log in as the existing bureau account, then regenerate Story Studio for 2026.")
}

main()
  .catch((error) => {
    console.error("Rich demo seed failed:", error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
