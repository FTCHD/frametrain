import { client } from '@/db/client'
import { frameTable } from '@/db/schema'
import { validatePayload } from '@/lib/farcaster'
import templates from '@/templates'
import type { InferInsertModel } from 'drizzle-orm'
import { encode } from 'next-auth/jwt'

export async function GET(
    request: Request,
    { params }: { params: { templateId: keyof typeof templates } }
) {
    const template = templates[params.templateId]

    if (!template?.shortDescription) {
        throw new Error('This template is not yet supported')
    }

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
    request: Request,
    { params }: { params: { templateId: keyof typeof templates } }
) {
    const body = await request.json()

    const validatedPayload = await validatePayload(body)
    if (validatedPayload.protocol !== 'farcaster') {
        throw new Error('Compose is only supported for Farcaster frames')
    }

    const templateId = params.templateId

    const serializedState = validatedPayload.state

    // TODO is this going to be a problem with the fc: prefix? Should we strip it?
    const fid = validatedPayload.userId
    const username = validatedPayload.userName
    const pfp_url = validatedPayload.userIcon

    const args: InferInsertModel<typeof frameTable> = {
        owner: fid,
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
            sub: fid,
            user: {
                'id': fid,
                'name': username,
                'image': pfp_url,
            },
            uid: fid,
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
