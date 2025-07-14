// Additional types for the application

// WYSIWYG content type
export interface WysiwygContent {
  type: "doc";
  content: Array<{
    type: string;
    content?: Array<{
      type: string;
      text?: string;
      marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
    }>;
    attrs?: Record<string, unknown>;
  }>;
}

export interface TeamWithMembers {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    id: string;
    role: "member" | "admin";
    joinedAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  }>;
}

export interface MoodEntryWithDetails {
  id: string;
  rating: "1" | "2" | "3" | "4" | "5";
  comment: WysiwygContent | string | null; // WYSIWYG content, plain text, or null
  isAnonymous: boolean;
  allowContact: boolean;
  dayOfWeek: string;
  entryDate: Date;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  } | null; // null if anonymous
  mentions: Array<{
    id: string;
    mentionedUser: {
      id: string;
      name: string;
    };
  }>;
}

export interface NotificationWithMetadata {
  id: string;
  type: "mention" | "team_invite" | "team_update";
  title: string;
  message: string;
  metadata: Record<string, string | number | boolean | null>;
  isRead: boolean;
  createdAt: Date;
}

// Utility functions for mood ratings
export const MOOD_RATINGS = {
  "1": { label: "Muy mal", color: "#EF4444", emoji: "😞" },
  "2": { label: "Mal", color: "#F97316", emoji: "😔" },
  "3": { label: "Regular", color: "#EAB308", emoji: "😐" },
  "4": { label: "Bien", color: "#22C55E", emoji: "😊" },
  "5": { label: "Excelente", color: "#10B981", emoji: "😄" },
} as const;

export const DAYS_OF_WEEK = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
} as const;

// Helper functions
export function getMoodRatingInfo(rating: "1" | "2" | "3" | "4" | "5") {
  return MOOD_RATINGS[rating];
}

export function getDayName(day: keyof typeof DAYS_OF_WEEK) {
  return DAYS_OF_WEEK[day];
}

export function formatMoodDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function canUserPostToday(allowedDays: string[]): boolean {
  const today = new Date();
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayName = dayNames[today.getDay()];
  return allowedDays.includes(todayName);
}

// Validation schemas (you might want to use Zod for more robust validation)
export interface CreateMoodEntryRequest {
  teamId: string;
  rating: "1" | "2" | "3" | "4" | "5";
  comment?: WysiwygContent | string;
  isAnonymous?: boolean;
  allowContact?: boolean;
  mentionedUserIds?: string[];
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface InviteUserRequest {
  teamId: string;
  email: string;
}

export interface UpdateUserSettingsRequest {
  allowedDays?: string[];
  timezone?: string;
  emailNotifications?: boolean;
  mentionNotifications?: boolean;
}

export interface PauseNotificationsRequest {
  reason?: string;
  pausedUntil?: string; // ISO date string
}
