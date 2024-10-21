import { type NextRequest, NextResponse } from 'next/server';

/**
 * Returns the current Figma access token for the user.
 * 
 * We use httpOnly cookies to prevent XSS, token leaks and request forgery.
 */
export async function GET(request: NextRequest) {
    const figmaAccessToken = request.cookies.get('figma_access_token')?.value;

    if (figmaAccessToken) {
        return NextResponse.json({ accessToken: figmaAccessToken });
    }

    return NextResponse.json({ accessToken: null });
}
