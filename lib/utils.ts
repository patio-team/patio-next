import { NextRequest, NextResponse } from 'next/server';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';
import { DateTime } from 'luxon';
import { PollDaysType } from '@/db/schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API Response utilities
export function createResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  );
}

export function createErrorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

// Request body utility
export async function getRequestBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate UUID
export function generateId(): string {
  return crypto.randomUUID();
}

// Generate token for invitations
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getPollDaysString(pollDays: Record<string, boolean>): string {
  const days = Object.entries(pollDays)
    .filter(([, value]) => value)
    .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));
  return days.join(', ');
}

export function getTimezone(): string {
  return 'UTC';
}

export function getTodayInTimezone(timezone?: string): DateTime {
  const tz = timezone || getTimezone();
  return DateTime.now().setZone(tz).startOf('day');
}

export function getDayOfWeek(date: Date | DateTime) {
  const dt = date instanceof Date ? DateTime.fromJSDate(date) : date;
  const dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return dayNames[dt.weekday % 7] as keyof PollDaysType;
}

export function canPostOnDate(date: DateTime): boolean {
  const today = getTodayInTimezone();
  return date <= today;
}

export function formatDateForDB(date: DateTime): Date {
  return date.toJSDate();
}

export function todayDate(timezone?: string): string {
  const tz = timezone || getTimezone();
  return DateTime.now().setZone(tz).toFormat('yyyy-MM-dd');
}

export function getLastValidDate(pollDays: PollDaysType): DateTime {
  const date = getUTCTime(todayDate());
  const dayOfWeek = getDayOfWeek(date);
  if (pollDays[dayOfWeek]) {
    return date;
  }

  let lastValidDate = date.minus({ days: 1 });
  while (!pollDays[getDayOfWeek(lastValidDate)]) {
    lastValidDate = lastValidDate.minus({ days: 1 });
  }
  return lastValidDate;
}

export async function awaitTimeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatMoodDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function transformToDateTime(jsDate: Date): DateTime {
  const formatted = jsDate.toISOString().split('T')[0];

  return getUTCTime(formatted);
}

export function getUTCTime(date: string): DateTime {
  return DateTime.fromISO(date, { zone: getTimezone() });
}
