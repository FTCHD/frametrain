import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'

const styles = ['Normal', 'Italic', 'Oblique']

export function FontStylePicker({
    defaultValue = 'normal',
    onSelect,
}: {
    defaultValue?: string
    onSelect: (value: string) => void
}) {
    return (
        <Select defaultValue="normal" onValueChange={onSelect}>
            <SelectTrigger className="w-full">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {styles.map((style) => (
                    <SelectItem key={style} value={style.toLowerCase()}>
                        {style}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}