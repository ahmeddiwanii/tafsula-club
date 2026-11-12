const { loadEnvConfig } = require("@next/env")
const { PrismaClient } = require("@prisma/client")
const bcryptjs = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

loadEnvConfig(process.cwd())

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL
  const rawPassword = process.env.SEED_ADMIN_PASSWORD

  if (!email || !rawPassword) {
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your local .env before running this script.",
    )
  }

  const hashedPassword = await bcryptjs.hash(rawPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "SUPERADMIN",
      updatedAt: new Date(),
    },
    create: {
      id: uuidv4(),
      name: process.env.SEED_ADMIN_NAME || "Platform Admin",
      email,
      password: hashedPassword,
      role: "SUPERADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  console.log("Superadmin ready:", admin.email)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
