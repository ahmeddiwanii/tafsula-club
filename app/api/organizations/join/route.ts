import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    if (!rateLimit(`join:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 })
    }

    const data = await req.json()
    const { orgName, orgType, contactName, contactEmail, contactPhone, description, websiteUrl } = data

    if (!orgName || !contactName || !contactEmail || !description) {
      return new NextResponse("Missing required fields", { status: 400 })
    }
    if (typeof contactEmail !== "string" || !contactEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    const request = await prisma.organizationJoinRequest.create({
      data: {
        orgName,
        orgType,
        contactName,
        contactEmail,
        contactPhone,
        description,
        websiteUrl,
      },
    })

    return NextResponse.json(request)
  } catch (error) {
    console.error("[ORGANIZATION_JOIN_REQUEST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
