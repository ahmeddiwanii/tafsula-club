export function getAppUrl() {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "")
}

/** Deep link encoded in event QR codes — phone camera opens check-in. */
export function eventCheckInUrl(eventId: string, code: string) {
  return `${getAppUrl()}/check-in/${eventId}?code=${encodeURIComponent(code)}`
}
