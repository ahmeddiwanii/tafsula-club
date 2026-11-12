const { loadEnvConfig } = require("@next/env")
const { PrismaClient } = require("@prisma/client")
const { hash } = require("bcryptjs")

loadEnvConfig(process.cwd())

const prisma = new PrismaClient()

const ORG_ID = "test-org-maison"

// Passwords come from local env only — never hardcode secrets in the repo.
const PASSWORD = {
  admin: process.env.SEED_ADMIN_PASSWORD,
  hr: process.env.SEED_HR_PASSWORD,
  member: process.env.SEED_MEMBER_PASSWORD,
}

if (!PASSWORD.admin || !PASSWORD.hr || !PASSWORD.member) {
  console.error(
    "Missing SEED_ADMIN_PASSWORD / SEED_HR_PASSWORD / SEED_MEMBER_PASSWORD in your local .env",
  )
  process.exit(1)
}

const accounts = [
  {
    id: "test-user-admin",
    email: "admin@tafsula.test",
    name: "Test Super Admin",
    role: "SUPERADMIN",
    password: PASSWORD.admin,
    organizationId: null,
    avatarId: 1,
    headline: "Platform admin",
    roleTitle: "Super admin",
  },
  {
    id: "test-user-hr",
    email: "hr@tafsula.test",
    name: "Test Bureau",
    role: "HR",
    password: PASSWORD.hr,
    organizationId: ORG_ID,
    avatarId: 3,
    headline: "Keeps the club door open",
    roleTitle: "Bureau",
  },
  {
    id: "test-user-member",
    email: "member@tafsula.test",
    name: "Test Member",
    role: "MEMBER",
    password: PASSWORD.member,
    organizationId: ORG_ID,
    avatarId: 5,
    headline: "Looking for a real night of work",
    roleTitle: "Member",
  },
]

async function main() {
  const now = new Date()
  const savedIds = {}
  const hashes = await Promise.all(accounts.map((account) => hash(account.password, 10)))

  await prisma.organization.upsert({
    where: { id: ORG_ID },
    update: { name: "Maison El Medina", updatedAt: now },
    create: {
      id: ORG_ID,
      name: "Maison El Medina",
      createdById: "test-user-hr",
      createdAt: now,
      updatedAt: now,
    },
  })

  for (const [index, account] of accounts.entries()) {
    const saved = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        password: hashes[index],
        role: account.role,
        avatarId: account.avatarId,
        organizationId: account.organizationId,
        memberStatus: "ACCEPTED",
        updatedAt: now,
      },
      create: {
        id: account.id,
        name: account.name,
        email: account.email,
        password: hashes[index],
        role: account.role,
        avatarId: account.avatarId,
        organizationId: account.organizationId,
        invitedById: account.role === "MEMBER" ? savedIds.HR : null,
        memberStatus: "ACCEPTED",
        createdAt: now,
        updatedAt: now,
      },
    })
    savedIds[account.role] = saved.id

    await prisma.profile.upsert({
      where: { userId: saved.id },
      update: {
        headline: account.headline,
        roleTitle: account.roleTitle,
        location: "Tunis",
      },
      create: {
        userId: saved.id,
        headline: account.headline,
        bio: "Fictional account for trying the Tafsula dashboards.",
        location: "Tunis",
        roleTitle: account.roleTitle,
      },
    })
  }

  const start = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000)

  await prisma.project.upsert({
    where: { id: "test-project-maison" },
    update: { title: "Open night at the medina", updatedAt: now },
    create: {
      id: "test-project-maison",
      organizationId: ORG_ID,
      title: "Open night at the medina",
      description: "A sample club night so the bureau and member dashboards have something to open.",
      type: "internal",
      status: "in-progress",
      visibility: "ORG",
      createdById: savedIds.HR,
      createdAt: now,
      updatedAt: now,
    },
  })

  await prisma.event.upsert({
    where: { id: "test-event-open-night" },
    update: { title: "Open night · Tunis", startAt: start, endAt: end, updatedAt: now },
    create: {
      id: "test-event-open-night",
      organizationId: ORG_ID,
      title: "Open night · Tunis",
      description: "A sample public night. Come, take a task, leave with proof.",
      type: "WORKSHOP",
      format: "IN_PERSON",
      visibility: "PUBLIC",
      status: "UPCOMING",
      startAt: start,
      endAt: end,
      location: "Tunis",
      venue: "Maison El Medina",
      createdById: savedIds.HR,
      createdAt: now,
      updatedAt: now,
    },
  })

  await prisma.team.upsert({
    where: { id: "test-team-welcome" },
    update: { name: "Welcome desk", updatedAt: now },
    create: {
      id: "test-team-welcome",
      organizationId: ORG_ID,
      name: "Welcome desk",
      purpose: "Meet people at the door.",
      description: "Sample team for the member dashboard.",
      status: "active",
      visibility: "ORG",
      createdById: savedIds.HR,
      projectId: "test-project-maison",
      eventId: "test-event-open-night",
      createdAt: now,
      updatedAt: now,
    },
  })

  await prisma.teamMember.upsert({
    where: { id: "test-team-member-hr" },
    update: { status: "ACCEPTED" },
    create: {
      id: "test-team-member-hr",
      teamId: "test-team-welcome",
      userId: savedIds.HR,
      roleInTeam: "Lead",
      status: "ACCEPTED",
      createdAt: now,
    },
  })

  await prisma.teamMember.upsert({
    where: { id: "test-team-member-1" },
    update: { status: "ACCEPTED" },
    create: {
      id: "test-team-member-1",
      teamId: "test-team-welcome",
      userId: savedIds.MEMBER,
      roleInTeam: "Welcome desk",
      status: "ACCEPTED",
      createdAt: now,
    },
  })

  await prisma.task.upsert({
    where: { id: "test-task-desk" },
    update: { title: "Hold the welcome desk", updatedAt: now },
    create: {
      id: "test-task-desk",
      projectId: "test-project-maison",
      title: "Hold the welcome desk",
      description: "Greet arrivals and check names for the open night.",
      status: "in-progress",
      priority: "high",
      assigneeId: savedIds.MEMBER,
      createdById: savedIds.HR,
      createdAt: now,
      updatedAt: now,
    },
  })

  console.log("Test accounts ready.")
  for (const account of accounts) {
    console.log(`${account.role}  ${account.email}  ${account.password}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
