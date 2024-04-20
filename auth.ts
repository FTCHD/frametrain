import { createAppClient, viemConnector } from '@farcaster/auth-client'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

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
    ],
    callbacks: {
        jwt: async ({ token, user, account, profile, trigger }) => {
            if (user) token.user = user
            if (user) {
                token.uid = user.id
            }
            return token
        },
        session: async ({ session, token, user }) => {
            if (token.user) session.user = { ...session.user, id: (token.user as any).id }
            //  session.user.uid = user.uid;
            return session
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
})