import { NextResponse } from "next/server"

/** Personality assessment removed from the product. */
export async function POST() {
  return NextResponse.json(
    { error: "The personality assessment has been removed." },
    { status: 410 },
  )
}
