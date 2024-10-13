import { type NextRequest, NextResponse } from 'next/server';

/**
 * Figma OAuth callback
 * See: https://www.figma.com/developers/api#oauth2
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const { FIGMA_CLIENT_ID, FIGMA_CLIENT_SECRET, NEXT_PUBLIC_HOST } = process.env;

    // Retrieve the stored state from the cookie and verify the CSRF token
    const stateParam = searchParams.get('state');
    const storedState = request.cookies.get('oauth_state')?.value;
    if (storedState !== stateParam) {
        return NextResponse.json({ error: 'State mismatch. Possible CSRF attack.' }, { status: 400 });
    }

    // Get the original page URL from the state
    let state;
    try {
        state = JSON.parse(decodeURIComponent(stateParam!));
    } catch {
        return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    // Exchange the authorization code for an access token
    const code = searchParams.get('code');
    const tokenUrl = 'https://api.figma.com/v1/oauth/token';
    const redirectUri = `${NEXT_PUBLIC_HOST}/api/auth/figma/callback`;

    const body = new URLSearchParams({
        client_id: FIGMA_CLIENT_ID as string,
        client_secret: FIGMA_CLIENT_SECRET as string,
        redirect_uri: redirectUri,
        code: code as string,
        grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
        return NextResponse.json({ error: 'Failed to exchange authorization code for token' }, { status: 400 });
    }

    const response = NextResponse.redirect(state.originalUrl);
    response.cookies.set('figma_access_token', tokenData.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    });
    response.cookies.set('figma_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    });
    response.cookies.set('figma_user_id', tokenData.user_id.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    });
    const expiresAt = Date.now() + tokenData.expires_in * 1000;
    response.cookies.set('figma_token_expires_at', expiresAt.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    });

    return response;
}
