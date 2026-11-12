import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    { error: "The personality assessment has been removed." },
    { status: 410 },
  )
}
