# Patio - Mood Tracking App

An application for teams to track their mood and well-being.

## Database Setup

### Prerequisites

- PostgreSQL installed and running
- Node.js 22+ and pnpm

### Setup

1. **Clone the repository and install dependencies**:

```bash
git clone <repo-url>
cd patio
pnpm install
```

2. **Set up environment variables**:

```bash
cp .env.example .env
```

Edit `.env` with your real values:

- `DATABASE_URL`: Your PostgreSQL connection string
- `SMTP_*`: Your email server configuration
- `BETTER_AUTH_*`: Authentication configuration
- `NEXT_PUBLIC_APP_URL`: Your app's URL

3. **Set up the database**:

```bash
# Generate migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Or use push for development (syncs the schema directly)
pnpm db:push
```

4. **Start the application**:

```bash
pnpm dev
```

### Database Scripts

- `pnpm db:generate` - Generates migration files based on schema changes
- `pnpm db:migrate` - Applies pending migrations to the database
- `pnpm db:push` - Directly syncs the schema (ideal for development)
- `pnpm db:studio` - Opens Drizzle Studio to explore the database

## Database Schema

### Main Tables

- **users**: User information, notification settings
- **teams**: Teams with unique invitation codes
- **team_members**: User-team relationship with roles (member/admin)
- **mood_entries**: Mood entries with ratings and comments
- **team_invitations**: Email invitations with security tokens

## Development

The project uses:

- **Next.js 15** with App Router
- **Drizzle ORM** for database
- **TypeScript** for static typing
- **Tailwind CSS** for styling
- **Better Auth** for authentication
- **Nodemailer** for sending emails

To explore the database during development:

```bash
pnpm db:studio
```

This will open Drizzle Studio in your browser to inspect and edit data.
