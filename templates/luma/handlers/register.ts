'use server'

import type { BuildFrameData, FrameValidatedActionPayload } from '@/lib/farcaster'
import { FrameError } from '@/sdk/error'
import type { Config, Storage } from '..'
import SuccessView from '../views/Success'

export async function register({
    config,
    body,
    storage,
}: {
    config: Config
    body: FrameValidatedActionPayload
    storage: Storage
}): Promise<BuildFrameData> {
    if (!config.event) throw new FrameError('No event found')
    let eventId = config.event.eventId
    let ticketTypeId = config.event.ticketTypeId
    const email = body.validatedData.input?.text as string | undefined

    if (!email) throw new FrameError('Please enter your email to register.')
    const fid = body.validatedData.interactor.fid as number
    const registeredUsers = storage.registeredUsers ?? []
    const guest = registeredUsers.find((u) => u.fid === fid)

    if (guest) {
        throw new FrameError(
            `You have already registered for this event. Check the inbox of: ${guest.email}`
        )
    }

    if (!(eventId && ticketTypeId)) {
        const request = await fetch('https://api.lu.ma/url?url=' + config.event.id)
        const response = (await request.json()) as {
            kind: 'event'
            data: {
                api_id: string
                ticket_types: {
                    api_id: string
                }[]
            }
        }

        console.log(`Event ID: ${response.data.api_id}`, response)

        eventId = response.data.api_id
        ticketTypeId = response.data.ticket_types[0].api_id
    }

    let newStorage = storage
    const data = {
        name: body.validatedData.interactor.display_name,
        ticket_type_to_selection: { [ticketTypeId]: { count: 1, amount: 0 } },
        email,
        event_api_id: eventId,
        timezone: config.event.timezone,
    }

    const request = await fetch('https://api.lu.ma/event/independent/register', {
        method: 'POST',
        headers: {
            'accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    const response = await request.json()

    console.log('Register response', response, { email, data })

    if ('message' in response) {
        throw new FrameError(response.message)
    }

    if (response.status !== 'success') {
        throw new FrameError('Failed to register')
    }

    registeredUsers.push({
        email,
        fid,
    })
    newStorage = {
        ...storage,
        registeredUsers,
    }

    return {
        storage: newStorage,
        buttons: [
            {
                label: 'Back',
            },
            {
                label: 'Create Your Own',
                action: 'link',
                target: 'https://frametra.in',
            },
        ],
        component: SuccessView(config.event.title),
        handler: 'success',
        webhooks: [
            {
                event: 'register',
                data: {
                    email,
                    eventId,
                    ticketTypeId,
                    eventSlug: config.event.id,
                    ticket: response.data.tickets[0],
                },
            },
        ],
    }
}
