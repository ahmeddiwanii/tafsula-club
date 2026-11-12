# Tafsula

Club operating system for youth organizations.

Tafsula gives a club one place to run membership, events, teams, tasks, and public presence — instead of spreading that work across chats, sheets, and posters.

Live product surfaces:

- **Public site** — discover clubs and events (French, English, Arabic)
- **Member app** — join a club, follow tasks, check in to nights, keep a profile
- **Bureau dashboard** — members, recruitment, events, QR check-in, teams, proposals
- **Story Studio** — turn a date range and a brief into a presentation (PDF / PPTX) from real club data
- **Platform admin** — organizations and oversight

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Auth | NextAuth (credentials) |
| Data | PostgreSQL, Prisma |
| Hosting | Vercel + a hosted Postgres (Neon or Supabase) |

## Setup

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run seed:test
npm run dev
```

Required environment variables are listed in `.env.example`:

- `DATABASE_URL` / `DIRECT_URL`
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`

Optional: SMTP for invites, `GROQ_API_KEY` or `OPENAI_API_KEY` for Story Studio copy.

`npm run seed:test` creates local demo roles (`admin@tafsula.test`, `hr@tafsula.test`, `member@tafsula.test`). Passwords come from `SEED_*_PASSWORD` in your `.env` and are printed once in the terminal. Do not commit real secrets.

## Deploy on Vercel

1. Create a Postgres database and run `npx prisma migrate deploy` against it.
2. Import the GitHub repo into Vercel.
3. Set the same environment variables as `.env.example`.
   Use your production URL for `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`.
4. Deploy. The build already runs `prisma generate`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run seed:test` | Demo club and role accounts |
| `npm run seed:demo-rich` | Larger demo dataset |

## License

MIT
