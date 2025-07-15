import { NextRequest, NextResponse } from 'next/server';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

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

// Generate invite code
export function generateInviteCode(): string {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

// Generate UUID
export function generateId(): string {
  return crypto.randomUUID();
}

// Generate token for invitations
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
