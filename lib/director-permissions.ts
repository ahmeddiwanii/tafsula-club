import { prisma } from "@/lib/db"

/**
 * Check if a user is a director/manager of a project
 */
export async function isProjectDirector(
  projectId: string,
  userId: string
): Promise<boolean> {
  const director = await prisma.projectDirector.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  })
  return !!director
}

/**
 * Check if a user is a director/manager of an event
 */
export async function isEventDirector(
  eventId: string,
  userId: string
): Promise<boolean> {
  const director = await prisma.eventDirector.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
  })
  return !!director
}

/**
 * Check if a user is a director/manager of a team
 */
export async function isTeamDirector(
  teamId: string,
  userId: string
): Promise<boolean> {
  const director = await prisma.teamDirector.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  })
  return !!director
}

/**
 * Get all directors of a project
 */
export async function getProjectDirectors(projectId: string) {
  return await prisma.projectDirector.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

/**
 * Get all directors of an event
 */
export async function getEventDirectors(eventId: string) {
  return await prisma.eventDirector.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

/**
 * Get all directors of a team
 */
export async function getTeamDirectors(teamId: string) {
  return await prisma.teamDirector.findMany({
    where: { teamId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

/**
 * Get all projects where user is a director
 */
export async function getUserProjectDirectorships(userId: string) {
  return await prisma.projectDirector.findMany({
    where: { userId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

/**
 * Get all events where user is a director
 */
export async function getUserEventDirectorships(userId: string) {
  return await prisma.eventDirector.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          startAt: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

/**
 * Get all teams where user is a director
 */
export async function getUserTeamDirectorships(userId: string) {
  return await prisma.teamDirector.findMany({
    where: { userId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          purpose: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}
