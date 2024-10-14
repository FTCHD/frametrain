import { NextResponse } from 'next/server';

/**
 * Figma signout
 */
export async function POST() {
    const response = NextResponse.json({ message: 'Signout successful' });

    // Clear Figma-related cookies
    response.cookies.delete('figma_access_token');
    response.cookies.delete('figma_refresh_token');
    response.cookies.delete('figma_user_id');
    response.cookies.delete('figma_token_expires_at');

    return response;
}