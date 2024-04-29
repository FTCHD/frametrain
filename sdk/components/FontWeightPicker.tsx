import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { googleFonts } from '../fonts'

export function FontWeightPicker({
    currentFont,
    defaultValue = '400',
    onSelect,
}: {
    currentFont: string
    defaultValue?: string
    onSelect: (value: string) => void
}) {
    const weights = googleFonts.find((font) => font.name === currentFont)?.weights

    if (!weights) {
        return null
    }

    const defaultWeight = (
        weights.find((weight) => weight.toString() === defaultValue) || weights[0]
    ).toString()

    return (
        <Select defaultValue={defaultWeight} onValueChange={onSelect}>
            <SelectTrigger className="w-full">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {weights.map((weight) => (
                    <SelectItem key={weight} value={weight.toString()}>
                        {weight}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}