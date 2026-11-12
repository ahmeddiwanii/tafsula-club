import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../../lib/auth"
import { prisma } from "../../../../../../lib/db"
import type { NextRequest } from "next/server"
import { updateMemberCredits } from "@/lib/credits"
import { calcAttendancePoints, resolvePointsFormula } from "@/lib/points"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", loginRequired: true }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const qrCode = body.qrCode || body.code
    const { id: eventId } = await params

    if (!qrCode) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 })
    }

    const qrCodeRecord = await prisma.eventQRCode.findUnique({
      where: { code: qrCode },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startAt: true,
            organizationId: true,
            organization: { select: { modulesJson: true, name: true } },
          },
        },
      },
    })

    if (!qrCodeRecord) {
      return NextResponse.json({ error: "Invalid QR code" }, { status: 400 })
    }

    if (qrCodeRecord.eventId !== eventId) {
      return NextResponse.json({ error: "QR code does not match this event" }, { status: 400 })
    }

    const event = qrCodeRecord.event
    const scannedAt = new Date()

    // Must be member of the club (accepted) — registration optional for walk-ups
    const membership = await prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: event.organizationId,
        },
      },
    })
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, memberStatus: true, role: true },
    })

    const inClub =
      membership?.status === "ACCEPTED" ||
      (user?.organizationId === event.organizationId &&
        user?.memberStatus === "ACCEPTED" &&
        (user.role === "MEMBER" || user.role === "HR"))

    if (!inClub) {
      return NextResponse.json(
        { error: "You need to be an approved member of this club to check in" },
        { status: 403 },
      )
    }

    const existing = await prisma.eventAttendance.findUnique({
      where: {
        eventId_userId: { eventId, userId: session.user.id },
      },
    })

    if (existing?.status === "ATTENDED" && (existing.pointsAwarded || 0) > 0) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        message: "You already checked in",
        attendance: existing,
        checkInTime: existing.checkInTime || existing.scannedAt,
        pointsAwarded: existing.pointsAwarded,
      })
    }

    const formula = resolvePointsFormula(event.organization.modulesJson)
    const { points, breakdown } = calcAttendancePoints({
      formula,
      eventStartAt: new Date(event.startAt),
      scannedAt,
    })

    const attendance = await prisma.eventAttendance.upsert({
      where: {
        eventId_userId: { eventId, userId: session.user.id },
      },
      update: {
        status: "ATTENDED",
        checkInTime: existing?.checkInTime || scannedAt,
        scannedAt,
        scannerUserId: session.user.id,
        qrCodeId: qrCodeRecord.id,
        pointsAwarded: points,
      },
      create: {
        eventId,
        userId: session.user.id,
        status: "ATTENDED",
        checkInTime: scannedAt,
        scannedAt,
        scannerUserId: session.user.id,
        qrCodeId: qrCodeRecord.id,
        pointsAwarded: points,
      },
    })

    await prisma.eventQRCode.update({
      where: { code: qrCode },
      data: { totalScans: { increment: 1 } },
    })

    await prisma.userEventStats.upsert({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: event.organizationId,
        },
      },
      update: { totalAttended: { increment: existing?.status === "ATTENDED" ? 0 : 1 } },
      create: {
        userId: session.user.id,
        organizationId: event.organizationId,
        totalAttended: 1,
      },
    })

    if (!existing || !(existing.pointsAwarded > 0)) {
      await updateMemberCredits(
        session.user.id,
        event.organizationId,
        points,
        `Checked in to "${event.title}" at ${scannedAt.toISOString()} (+${breakdown.base}${breakdown.earlyBonus ? ` +${breakdown.earlyBonus} early` : ""})`,
      )
    }

    return NextResponse.json({
      success: true,
      message: "You’re checked in",
      attendance,
      checkInTime: scannedAt,
      pointsAwarded: points,
      breakdown,
      eventTitle: event.title,
      organizationName: event.organization.name,
    })
  } catch (error) {
    console.error("Error scanning QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
