import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import { validatePayload } from '@/lib/serve'
import templates from '@/templates'
import type { InferInsertModel } from 'drizzle-orm'
import { encode } from 'next-auth/jwt'
// import { decode, encode } from 'next-auth/jwt';

export async function GET(
    request: Request,
    { params }: { params: { templateId: keyof typeof templates } }
) {
    if (params.templateId !== 'cal') {
        throw new Error('This template is not yet supported')
    }

    const template = templates[params.templateId]

    return Response.json({
        'type': 'composer',
        'name': template.name,
        'icon': 'task', // https://docs.farcaster.xyz/reference/actions/spec#valid-icons
        'description': template.shortDescription,
        // 'aboutUrl': `https://${process.env.NEXT_PUBLIC_HOST}/templates/${template.name}`,
        'imageUrl': 'https://frametra.in/apple-icon.png',
        'action': {
            'type': 'post',
        },
    })
}

export async function POST(
    request: Request,
    { params }: { params: { templateId: keyof typeof templates } }
) {
    if (params.templateId !== 'cal') {
        throw new Error('This template is not yet supported')
    }

    const body = await request.json()

    const validatedData = await validatePayload(body)

    const templateId = params.templateId

    const serializedState = validatedData.action.state.serialized

    const { fid, username, pfp_url } = validatedData.action.interactor

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