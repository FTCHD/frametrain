import { type NextRequest, NextResponse } from 'next/server';

/**
 * Figma OAuth signin redirect
 * See: https://www.figma.com/developers/api#oauth2
 */
export async function GET(request: NextRequest) {
    const { FIGMA_CLIENT_ID, NEXT_PUBLIC_HOST } = process.env;

    // biome-ignore lint/complexity/useSimplifiedLogicExpression: <explanation>
    if (!FIGMA_CLIENT_ID || !NEXT_PUBLIC_HOST) {
        return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    // Get the original page URL from query params or referrer header
    const originalUrl = request.nextUrl.searchParams.get('original_url');

    // URL redirection attacks
    if (!originalUrl?.startsWith(NEXT_PUBLIC_HOST)) {
        return NextResponse.json({ error: 'Invalid redirect URL' }, { status: 400 });
    }

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
