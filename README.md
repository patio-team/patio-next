# Patio - Mood Tracking App

An application for teams to track their mood and well-being.

## Database Setup

### Prerequisites

- PostgreSQL installed and running
- Node.js 22 and pnpm

### Setup

1. **Clone the repository and install dependencies**:

```bash
git clone git@github.com:patio-team/patio-next.git
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

## Email System

Patio includes an email system for team invitations and daily mood tracking reminders.

### Email Templates

Email templates are built using MJML and compiled to HTML:

- `emails/invitation.mjml` - Team invitation email template
- `emails/reminder.mjml` - Daily mood tracking reminder email template

### Email Scripts

- `pnpm compile:emails` - Compiles MJML email templates to HTML
- `pnpm send-reminders` - Sends daily mood tracking reminders to team members

**Manual execution:**

```bash
# Send reminders manually
pnpm send-reminders
```
