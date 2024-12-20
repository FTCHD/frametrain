import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import { validatePayload } from '@/lib/serve'
import templates from '@/templates'
import type { InferInsertModel } from 'drizzle-orm'
import { encode } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { templateId: keyof typeof templates } }
) {
    const template = templates[params.templateId]

    if (!template?.shortDescription) {
        throw new Error('This template is not yet supported')
    }

    const searchParams: Record<string, string> = {}

    request.nextUrl.searchParams.forEach((value, key) => {
        searchParams[key] = value
    })

    console.log('searchParams', searchParams)

    return Response.json({
        'type': 'composer',
        'name': template.name,
        'icon': template.octicon, // https://docs.farcaster.xyz/reference/actions/spec#valid-icons
        'description': template.shortDescription,
        // 'aboutUrl': `https://${process.env.NEXT_PUBLIC_HOST}/templates/${template.name}`,
        // 'imageUrl': 'https://frametra.in/apple-icon.png',
        'imageUrl': process.env.NEXT_PUBLIC_HOST + template.icon.src,
        'action': {
            'type': 'post',
        },
    })
}

export async function POST(
    request: NextRequest,
    { params }: { params: { templateId: keyof typeof templates } }
) {
    const searchParams: Record<string, string | undefined> = {
        q: request.nextUrl.searchParams.get('q') || undefined,
        t: request.nextUrl.searchParams.get('t') || undefined,
    }

    if (searchParams.q) {
        return Response.json({
            type: 'form',
            title: searchParams.t || 'Mini App',
            url: searchParams.q,
        })
    }

    const body = await request.json()

    const validatedPayload = await validatePayload(body)

    const templateId = params.templateId

    const serializedState = validatedPayload.state.serialized

    const { fid, username, pfp_url } = validatedPayload.interactor

    const args: InferInsertModel<typeof frameTable> = {
        owner: fid.toString(),
        name: 'New Frame',
        description: undefined,
        config: templates[templateId].initialConfig,
        draftConfig: templates[templateId].initialConfig,
        storage: {},
        template: templateId,
    }

    const frame = await client.insert(frameTable).values(args).returning().get()

    const token = {
        token: {
            name: username,
            picture: pfp_url,
            sub: fid.toString(),
            user: {
                'id': fid.toString(),
                'name': username,
                'image': pfp_url,
            },
            uid: fid.toString(),
        },
        secret: process.env.AUTH_SECRET!,
        salt: process.env.AUTH_SESSION_COOKIE_NAME!,
    }

    const encodedToken = await encode(token)

    return Response.json({
        type: 'form',
        title: `Create a ${templateId[0].toUpperCase() + templateId.slice(1)} Frame`,
        url:
            `${process.env.NEXT_PUBLIC_HOST}/api/compose/${templateId}/${frame.id}?t=` +
            encodedToken +
            '&s=' +
            serializedState,
    })
}
