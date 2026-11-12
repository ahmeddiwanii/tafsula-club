export interface HRSessionUser {
  role: string
  organizationId: string | null
  name: string | null
}

export function getHRSessionUser(session: unknown): HRSessionUser | null {
  if (
    !session ||
    typeof session !== "object" ||
    !("user" in session) ||
    !session.user ||
    typeof session.user !== "object" ||
    !("role" in session.user) ||
    typeof session.user.role !== "string"
  ) {
    return null
  }

  const organizationId =
    "organizationId" in session.user &&
    typeof session.user.organizationId === "string"
      ? session.user.organizationId
      : null
  const name =
    "name" in session.user && typeof session.user.name === "string"
      ? session.user.name
      : null

  return {
    role: session.user.role,
    organizationId,
    name,
  }
}
