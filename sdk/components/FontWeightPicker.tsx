import { useEffect, useMemo, useState } from 'react'
import { getGoogleFonts } from '../fonts'
import { Select } from './Select'

export function FontWeightPicker({
    currentFont,
    defaultValue = '400',
    onSelect,
}: {
    currentFont: string
    defaultValue?: string
    onSelect: (value: string) => void
}) {
    const [fonts, setFonts] = useState<
        {
            id: string
            name: string
            weights: number[]
            styles: string[]
        }[]
    >([
        {
            'id': 'roboto',
            'name': 'Roboto',
            'weights': [100, 300, 400, 500, 700, 900],
            'styles': ['italic', 'normal'],
        },

        {
            'id': 'open-sans',
            'name': 'Open Sans',
            'weights': [300, 400, 500, 600, 700, 800],
            'styles': ['italic', 'normal'],
        },

        {
            'id': 'montserrat',
            'name': 'Montserrat',
            'weights': [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'styles': ['italic', 'normal'],
        },

        {
            'id': 'lato',
            'name': 'Lato',
            'weights': [100, 300, 400, 700, 900],
            'styles': ['italic', 'normal'],
        },

        {
            'id': 'poppins',
            'name': 'Poppins',
            'weights': [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'styles': ['italic', 'normal'],
        },

        {
            'id': 'source-sans-3',
            'name': 'Source Sans 3',
            'weights': [200, 300, 400, 500, 600, 700, 800, 900],
            'styles': ['italic', 'normal'],
        },

        {
            'id': 'raleway',
            'name': 'Raleway',
            'weights': [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'styles': ['italic', 'normal'],
        },
        {
            'id': 'raleway-dots',
            'name': 'Raleway Dots',
            'weights': [400],
            'styles': ['normal'],
        },

        {
            'id': 'inter',
            'name': 'Inter',
            'weights': [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'styles': ['normal'],
        },
        {
            'id': 'inter-tight',
            'name': 'Inter Tight',
            'weights': [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'styles': ['italic', 'normal'],
        },

        {
            'id': 'merriweather',
            'name': 'Merriweather',
            'weights': [300, 400, 700, 900],
            'styles': ['italic', 'normal'],
        },

        {
            'id': 'oswald',
            'name': 'Oswald',
            'weights': [200, 300, 400, 500, 600, 700],
            'styles': ['normal'],
        },

        {
            'id': 'ubuntu',
            'name': 'Ubuntu',
            'weights': [300, 400, 500, 700],
            'styles': ['italic', 'normal'],
        },

        {
            'id': 'playfair',
            'name': 'Playfair',
            'weights': [300, 400, 500, 600, 700, 800, 900],
            'styles': ['italic', 'normal'],
        },

        {
            'id': 'nunito',
            'name': 'Nunito',
            'weights': [200, 300, 400, 500, 600, 700, 800, 900],
            'styles': ['italic', 'normal'],
        },

        {
            'id': 'titillium-web',
            'name': 'Titillium Web',
            'weights': [200, 300, 400, 600, 700, 900],
            'styles': ['italic', 'normal'],
        },
    ])

    useEffect(() => {
        async function loadFonts() {
            const googleFonts = await getGoogleFonts()
            setFonts(googleFonts)
        }
        loadFonts()
    }, [])

    const weights = useMemo(
        () => fonts.find((font) => font.name === currentFont)?.weights,
        [fonts, currentFont]
    )

    const defaultWeight = useMemo(
        () =>
            (
                weights?.find((weight) => weight.toString() === defaultValue) || weights?.[0]
            )?.toString(),
        [weights, defaultValue]
    )

    if (!weights) {
        return null
    }

    return (
        <Select defaultValue={defaultWeight} onChange={onSelect}>
            {weights.map((weight) => (
                <option key={weight} value={weight.toString()}>
                    {weight}
                </option>
            ))}
        </Select>
    )
}
