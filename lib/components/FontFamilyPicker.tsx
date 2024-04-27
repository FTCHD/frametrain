import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'

// download family & weights from here
// https://raw.githubusercontent.com/fontsource/font-files/main/metadata/google-fonts-v2.json
// https://github.com/datalogix/google-fonts-helper/blob/main/src/google-fonts-metadata.ts

const fonts = [
    'Roboto',
    'Lato',
    'Oswald',
    'Montserrat',
    'Roboto Mono',
    'Inter',
    'Poppins',
    'Space Grotesk',
    'Roboto Slab',
    'Merriweather',
    'Nunito',
    'Open Sans',
    'Raleway',
    'Roboto Condensed',
    'Ubuntu',
    'Work Sans',
    'Noto Sans',
    'Lora',
    'Playfair Display',
    'Cormorant Garamond',
]

export function FontFamilyPicker({
    defaultValue = 'Roboto',
    onSelect,
}: {
    defaultValue?: string
    onSelect: (value: string) => void
}) {
    return (
        <Select defaultValue={defaultValue} onValueChange={onSelect}>
            <SelectTrigger className="w-full">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {fonts.map((font) => (
                    <SelectItem key={font} value={font}>
                        {font}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}