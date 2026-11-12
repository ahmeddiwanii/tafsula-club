import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/db"

export async function GET() {
  const health = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      url: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      connection: "❌ Unknown",
    },
    auth: {
      secret: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
      url: process.env.NEXTAUTH_URL ? "✅ Set" : "❌ Missing",
    },
    api: {
      huggingFace: process.env.HUGGING_FACE_API_KEY ? "✅ Set" : "❌ Missing",
    },
  }

  // Test database connection
  try {
    await prisma.$connect()
    health.database.connection = "✅ Connected"
    await prisma.$disconnect()
  } catch (error) {
    health.database.connection = `❌ Failed: ${error instanceof Error ? error.message : "Unknown error"}`
  }

  return NextResponse.json(health)
} 