import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { googleFonts } from '../fonts'

export function FontStylePicker({
    currentFont,
    defaultValue = 'normal',
    onSelect,
}: {
    currentFont: string
    defaultValue?: string
    onSelect: (value: string) => void
}) {
    const styles = googleFonts.find((font) => font.name === currentFont)?.styles

    if (!styles) {
        return null
    }

    const defaultStyle = styles.find((style) => style === defaultValue) || styles[0]

    return (
        <Select defaultValue={defaultStyle} onValueChange={onSelect}>
            <SelectTrigger className="w-full">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {styles.map((style) => (
                    <SelectItem key={style} value={style}>
                        {style}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}