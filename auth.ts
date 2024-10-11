import { createAppClient, viemConnector } from '@farcaster/auth-client'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { Provider } from "next-auth/providers";
import type { Session } from 'next-auth';

// Extend the Session type to include figmaAccessToken
export interface FrameTrainSession extends Session {
    figmaAccessToken?: string;
}

export interface FrameTrainSession extends Session {
    figmaAccessToken?: string;
}

const FigmaProvider: Provider = {
    id: "figma",
    name: "Figma",
    type: "oauth",
    authorization: {
        url: "https://www.figma.com/oauth",
        params: {
            scope: "files:read",
            response_type: "code",
            state: "{}"
        },
    },
    token: {
        url: "https://api.figma.com/v1/oauth/token",
        async request(context: any) {
            const provider = context.provider;

            const res = await fetch(
                `https://api.figma.com/v1/oauth/token?client_id=${provider.clientId}&client_secret=${provider.clientSecret}&redirect_uri=${provider.CallbackUrl}&code=${context.params.code}&grant_type=authorization_code`,
                { method: "POST" }
            );
            const json = await res.json();

            return { tokens: json };
        },
    },
    userinfo: "https://api.figma.com/v1/me",
    profile(profile) {
        return {
            id: profile.id,
            name: `${profile.handle}`,
            email: profile.email,
            image: profile.img_url,nre
        };
    },
    clientId: process.env.FIGMA_CLIENT_ID,
    clientSecret: process.env.FIGMA_CLIENT_SECRET
};


export const {
    handlers: { GET, POST },
    auth,
} = NextAuth({
    theme: {
        logo: 'https://next-auth.js.org/img/logo/logo-sm.png',
    },
    providers: [
        CredentialsProvider({
            name: 'Sign in with Farcaster',
            credentials: {
                message: {
                    label: 'Message',
                    type: 'text',
                    placeholder: '0x0',
                },
                signature: {
                    label: 'Signature',
                    type: 'text',
                    placeholder: '0x0',
                },
                // In a production app with a server, these should be fetched from
                // your Farcaster data indexer rather than have them accepted as part
                // of credentials.
                // ...jfc i love dEcEnTrAlIzaTiOn
                name: {
                    label: 'Name',
                    type: 'text',
                    placeholder: '0x0',
                },
                pfp: {
                    label: 'Pfp',
                    type: 'text',
                    placeholder: '0x0',
                },
            },
            authorize: async (credentials, req) => {
                const { csrfToken } = (await req.json()) as any

                const appClient = createAppClient({
                    ethereum: viemConnector(),
                })

                const { success, fid } = await appClient.verifySignInMessage({
                    message: credentials?.message as string,
                    signature: credentials?.signature as `0x${string}`,
                    domain: process.env.NEXT_PUBLIC_DOMAIN!,
                    nonce: csrfToken,
                })

                if (!success) {
                    return null
                }

                return {
                    id: fid.toString(),
                    name: credentials.name as string,
                    image: credentials?.pfp as string,
                }
            },
        }),
        FigmaProvider,
    ],
    callbacks: {
        jwt: async ({ token, user, account, profile, trigger }) => {
            if (user) {
                token.user = user
                token.uid = user.id
            }
            if (account?.provider === 'figma') {
                // If the user is connecting Figma, store the access token for Figma
                token.figmaAccessToken = account.access_token;
            }
            return token
        },
        session: async ({ session, token, user }) => {
            const frameTrainSession = session as FrameTrainSession;
            if (token.user) frameTrainSession.user = { ...frameTrainSession.user, id: (token.user as any).id };
            frameTrainSession.figmaAccessToken = token.figmaAccessToken as string | undefined;
            return frameTrainSession;
        },
    },
    events: {
        async signIn(message) {
            /* on successful sign in */
        },
        async signOut(message) {
            /* on signout */
        },
        async createUser(message) {
            /* user created */
        },
        async updateUser(message) {
            /* user updated - e.g. their email was verified */
        },
        async linkAccount(message) {
            /* account (e.g. Twitter) linked to a user */
        },
        async session(message) {
            /* session is active */
        },
    },
    pages: {
        signIn: '/login',
        signOut: '/',
        error: '/', // Error code passed in query string as ?error=
        verifyRequest: '/', // (used for check email message)
        // newUser: null // If set, new users will be directed here on first sign in
    },
    debug: false,
    cookies: {
        sessionToken: {
            name: process.env.AUTH_SESSION_COOKIE_NAME,
            options: {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            },
        },
        csrfToken: {
            name: process.env.AUTH_CSRF_COOKIE_NAME,
            options: {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            },
        },
    },
})