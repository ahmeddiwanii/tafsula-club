import nodemailer from "nodemailer"

function appUrl() {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "")
}

function getTransporter() {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    return null
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: { user: smtpUser, pass: smtpPass },
  })
}

export async function sendInviteEmail({ to, password }: { to: string; password: string }) {
  const loginUrl = `${appUrl()}/auth/login`
  const transporter = getTransporter()

  if (!transporter) {
    if (process.env.NODE_ENV === "development") {
      console.log("[email:dev] invite would be sent to:", to)
    }
    return { messageId: "dev-mode-" + Date.now() }
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Welcome to Tafsula — your club account",
    text: `Welcome to Tafsula!\n\nEmail: ${to}\nTemporary password: ${password}\n\nLog in: ${loginUrl}\nPlease change your password after signing in.\n\n— Tafsula`,
    html: `<p>Welcome to <b>Tafsula</b>!</p><p>Your club account is ready.</p><ul><li><b>Email:</b> ${to}</li><li><b>Temporary password:</b> ${password}</li></ul><p><a href="${loginUrl}">Log in</a> and change your password.</p><p>— Tafsula</p>`,
  })

  return info
}

export async function sendAcceptanceEmail({ to, name }: { to: string; name?: string | null }) {
  const dashboardUrl = `${appUrl()}/dashboard/member/home`
  const transporter = getTransporter()
  const hello = name ? `Hi ${name.split(" ")[0]},` : "Hi,"

  if (!transporter) {
    if (process.env.NODE_ENV === "development") {
      console.log("[email:dev] acceptance would be sent to:", to)
    }
    return { messageId: "dev-mode-" + Date.now() }
  }

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "You’re approved — welcome to the club",
    text: `${hello}\n\nGreat news — your club approved your request.\nOpen your dashboard: ${dashboardUrl}\n\n— Tafsula`,
    html: `<p>${hello}</p><p>Great news — your club approved your request.</p><p><a href="${dashboardUrl}">Open your dashboard</a></p><p>— Tafsula</p>`,
  })
}

export async function sendRejectionEmail({ to }: { to: string }) {
  const transporter = getTransporter()

  if (!transporter) {
    if (process.env.NODE_ENV === "development") {
      console.log("[email:dev] rejection would be sent to:", to)
    }
    return { messageId: "dev-mode-" + Date.now() }
  }

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Update on your Tafsula club application",
    text: `Hello,\n\nThank you for your interest. At this time we will not be moving forward.\n\n— Tafsula`,
    html: `<p>Hello,</p><p>Thank you for your interest. At this time we will not be moving forward.</p><p>— Tafsula</p>`,
  })
}

export async function sendPasswordResetEmail({ to, resetUrl }: { to: string; resetUrl: string }) {
  const transporter = getTransporter()

  if (!transporter) {
    if (process.env.NODE_ENV === "development") {
      console.log("[email:dev] password reset link for", to, resetUrl)
    }
    return { messageId: "dev-mode-" + Date.now(), resetUrl }
  }

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your Tafsula password",
    text: `Reset your password: ${resetUrl}\n\nIf you did not request this, ignore this email.`,
    html: `<p><a href="${resetUrl}">Reset your password</a></p><p>If you did not request this, ignore this email.</p>`,
  })
}
