import { type NextRequest, NextResponse } from 'next/server';

/**
 * Figma OAuth signin redirect
 * See: https://www.figma.com/developers/api#oauth2
 */
export async function GET(request: NextRequest) {
    const { FIGMA_CLIENT_ID, NEXT_PUBLIC_HOST } = process.env;

    // Get the original page URL from query params or referrer header
    const originalUrl = request.nextUrl.searchParams.get('original_url');

    const redirectUri = `${NEXT_PUBLIC_HOST}/api/auth/figma/callback`;
    const state = JSON.stringify({
        csrfToken: Math.random().toString(36).substring(2),
        originalUrl: originalUrl,
    });

    const response = NextResponse.redirect(
        `https://www.figma.com/oauth?client_id=${FIGMA_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=files:read&response_type=code&state=${encodeURIComponent(state)}`
    );

    // Set CSRF token in a cookie (optional for added security)
    response.cookies.set('oauth_state', state, { httpOnly: true, secure: true, sameSite: 'none', path: '/' });

    return response;
}
