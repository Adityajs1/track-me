import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, deleteSession, clearAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      await deleteSession(token);
    }
    const response = NextResponse.json({ success: true });
    clearAuthCookie(response);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ success: true });
    clearAuthCookie(response);
    return response;
  }
}
