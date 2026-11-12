/**
 * Club points formulas — editable per org via organization.modulesJson.pointsFormula
 */

export type PointsFormula = {
  /** Points for scanning the event QR (default 15) */
  attendanceScan: number
  /** Extra points if checked in within the first N minutes of start (default 5) */
  earlyBonus: number
  /** Window in minutes after event start for early bonus (default 30) */
  earlyWindowMinutes: number
  /** Points when HR approves a task (default 10) */
  taskApproved: number
}

export const DEFAULT_POINTS_FORMULA: PointsFormula = {
  attendanceScan: 15,
  earlyBonus: 5,
  earlyWindowMinutes: 30,
  taskApproved: 10,
}

export function resolvePointsFormula(modulesJson: unknown): PointsFormula {
  const raw =
    modulesJson && typeof modulesJson === "object"
      ? (modulesJson as { pointsFormula?: Partial<PointsFormula> }).pointsFormula
      : undefined
  return {
    attendanceScan: Number(raw?.attendanceScan ?? DEFAULT_POINTS_FORMULA.attendanceScan) || 15,
    earlyBonus: Number(raw?.earlyBonus ?? DEFAULT_POINTS_FORMULA.earlyBonus) || 5,
    earlyWindowMinutes:
      Number(raw?.earlyWindowMinutes ?? DEFAULT_POINTS_FORMULA.earlyWindowMinutes) || 30,
    taskApproved: Number(raw?.taskApproved ?? DEFAULT_POINTS_FORMULA.taskApproved) || 10,
  }
}

export function calcAttendancePoints(opts: {
  formula: PointsFormula
  eventStartAt: Date
  scannedAt?: Date
}): { points: number; breakdown: { base: number; earlyBonus: number } } {
  const scannedAt = opts.scannedAt ?? new Date()
  const minsAfterStart = (scannedAt.getTime() - opts.eventStartAt.getTime()) / 60000
  const early =
    minsAfterStart >= -15 && minsAfterStart <= opts.formula.earlyWindowMinutes
      ? opts.formula.earlyBonus
      : 0
  return {
    points: opts.formula.attendanceScan + early,
    breakdown: { base: opts.formula.attendanceScan, earlyBonus: early },
  }
}
