'use client'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { CssVarsProvider as JoyCssVarsProvider, extendTheme } from '@mui/joy/styles'
import CssBaseline from '@mui/material/CssBaseline'
import {
    THEME_ID as MATERIAL_THEME_ID,
    Experimental_CssVarsProvider as MaterialCssVarsProvider,
    experimental_extendTheme as materialExtendTheme,
} from '@mui/material/styles'
import { useServerInsertedHTML } from 'next/navigation'
import { type ReactNode, useState } from 'react'

export default function ThemeRegistry({
    children,
}: {
    children: ReactNode
}) {
    const materialTheme = materialExtendTheme()
    const [{ cache, flush }] = useState(() => {
        const cache = createCache({ key: 'joy' })
        cache.compat = true
        const prevInsert = cache.insert
        let inserted: string[] = []
        cache.insert = (...args) => {
            const serialized = args[1]
            if (cache.inserted[serialized.name] === undefined) {
                inserted.push(serialized.name)
            }
            return prevInsert(...args)
        }
        const flush = () => {
            const prevInserted = inserted
            inserted = []
            return prevInserted
        }
        return { cache, flush }
    })

    useServerInsertedHTML(() => {
        const names = flush()
        if (names.length === 0) {
            return null
        }
        let styles = ''
        for (const name of names) {
            styles += cache.inserted[name]
        }
        return (
            <style
                key={cache.key}
                data-emotion={`${cache.key} ${names.join(' ')}`}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: <>
                dangerouslySetInnerHTML={{
                    __html: styles,
                }}
            />
        )
    })

    return (
        <CacheProvider value={cache}>
            <MaterialCssVarsProvider
                defaultMode="dark"
                defaultColorScheme={'dark'}
                theme={{ [MATERIAL_THEME_ID]: materialTheme }}
            >
                <JoyCssVarsProvider
                    defaultMode="dark"
                    defaultColorScheme={'dark'}
                    theme={extendTheme({
                        fontFamily: {
                            display:
                                'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
                            body: 'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
                            code: 'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
                            fallback:
                                'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
                        },
                        cssVarPrefix: 'ft',
                    })}
                >
                    <CssBaseline enableColorScheme={true} />
                    {children}
                </JoyCssVarsProvider>
            </MaterialCssVarsProvider>
        </CacheProvider>
    )
}
