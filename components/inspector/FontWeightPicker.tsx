import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/shadcn/Select'

const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900].map((w) => w.toString())

export function FontWeightPicker({
    onSelect,
}: {
    onSelect: (value: string) => void
}) {
    return (
        <Select defaultValue="500" onValueChange={onSelect}>
            <SelectTrigger className="w-full">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {weights.map((weight) => (
                    <SelectItem key={weight} value={weight}>
                        {weight}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}