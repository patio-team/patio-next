import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  json,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const moodRatingEnum = pgEnum('mood_rating', ['1', '2', '3', '4', '5']);
export const dayOfWeekEnum = pgEnum('day_of_week', [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);
export const userRoleEnum = pgEnum('user_role', ['member', 'admin']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'mention',
  'team_invite',
  'team_update',
]);

export const visibilityEnum = pgEnum('visibility', ['public', 'private']);

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp('updated_at').$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

// Teams table
export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  pollDays: json('poll_days')
    .$type<{
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    }>()
    .notNull()
    .default({
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Team members (junction table for users and teams)
export const teamMembers = pgTable('team_members', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  role: userRoleEnum('role').default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Mood entries table
export const moodEntries = pgTable('mood_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  rating: moodRatingEnum('rating').notNull(),
  comment: text('comment'),
  visibility: visibilityEnum('visibility').default('public').notNull(),
  allowContact: boolean('allow_contact').default(true).notNull(),
  entryDate: timestamp('entry_date').notNull(), // The actual date of the entry
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Team invitations table
export const teamInvitations = pgTable('team_invitations', {
  id: text('id').primaryKey(),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  invitedBy: text('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  rejectedAt: timestamp('rejected_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  metadata: json('metadata'), // Additional data for the notification
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Mentions table (for user mentions in mood entries)
export const mentions = pgTable('mentions', {
  id: text('id').primaryKey(),
  moodEntryId: text('mood_entry_id')
    .notNull()
    .references(() => moodEntries.id, { onDelete: 'cascade' }),
  mentionedUserId: text('mentioned_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  mentionedByUserId: text('mentioned_by_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User settings table
export const userSettings = pgTable('user_settings', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  allowedDays: json('allowed_days')
    .default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
    .notNull(), // Days user wants to submit mood
  timezone: varchar('timezone', { length: 100 }).default('UTC').notNull(),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  mentionNotifications: boolean('mention_notifications')
    .default(true)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  teamMembers: many(teamMembers),
  moodEntries: many(moodEntries),
  sentInvitations: many(teamInvitations, { relationName: 'invitedBy' }),
  notifications: many(notifications),
  mentionsSent: many(mentions, { relationName: 'mentionedBy' }),
  mentionsReceived: many(mentions, { relationName: 'mentionedUser' }),
  settings: one(userSettings),
  accounts: many(account),
  sessions: many(session),
}));

export const accountsRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(session, ({ one }) => ({
  user: one(users, {
    fields: [session.userId],
    references: [users.id],
  }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
  moodEntries: many(moodEntries),
  invitations: many(teamInvitations),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const moodEntriesRelations = relations(moodEntries, ({ one, many }) => ({
  user: one(users, {
    fields: [moodEntries.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [moodEntries.teamId],
    references: [teams.id],
  }),
  mentions: many(mentions),
}));

export const teamInvitationsRelations = relations(
  teamInvitations,
  ({ one }) => ({
    team: one(teams, {
      fields: [teamInvitations.teamId],
      references: [teams.id],
    }),
    inviter: one(users, {
      fields: [teamInvitations.invitedBy],
      references: [users.id],
    }),
  }),
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const mentionsRelations = relations(mentions, ({ one }) => ({
  moodEntry: one(moodEntries, {
    fields: [mentions.moodEntryId],
    references: [moodEntries.id],
  }),
  mentionedUser: one(users, {
    fields: [mentions.mentionedUserId],
    references: [users.id],
    relationName: 'mentionedUser',
  }),
  mentionedByUser: one(users, {
    fields: [mentions.mentionedByUserId],
    references: [users.id],
    relationName: 'mentionedBy',
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamMemberWithTeam = TeamMember & {
  team: Team;
};
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type NewMoodEntry = typeof moodEntries.$inferInsert;
export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type NewTeamInvitation = typeof teamInvitations.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Mention = typeof mentions.$inferSelect;
export type NewMention = typeof mentions.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
