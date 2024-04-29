import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'
import { googleFonts } from '../fonts'

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
                {googleFonts.map((font) => (
                    <SelectItem key={font.name} value={font.name}>
                        {font.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}


