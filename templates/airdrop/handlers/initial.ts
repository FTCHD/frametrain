'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import * as z from 'zod'
import type { Config, LinkButton, Storage } from '..'
import Cover from '../views/Cover'

export default async function initial({
    body,
    config,
    storage,
    params,
}: {
    // GET requests don't have a body.
    body: undefined
    config: Config
    storage: Storage
    params: any
}): Promise<BuildFrameData> {
    function isValidUrl(url: string) {
        const { success } = z.string().url().min(1).safeParse(url)
        return success
    }

    const roboto = await loadGoogleFontAllVariants('Roboto')
    function createButton(button: any, index: number): LinkButton {
        const target = isValidUrl(button.target)
            ? button.target
            : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        const label = button.label || `Button ${index + 1}`
        return { label, action: 'link', target }
    }

    // In the main function
    if (!Array.isArray(config.buttons)) {
        throw new Error('Invalid config: buttons must be an array')
    }
    const buttons = config.buttons.map(createButton)

    return {
        buttons: [{ label: 'Claim' }, ...buttons],
        fonts: roboto,
        component: Cover(config),
        handler: 'claim',
    }
}
