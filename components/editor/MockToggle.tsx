
import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'

export default function MockOptionsToggle() {
    const [value, setValue] = useState<string[]>([])
    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full">
            <h1 className="text-lg font-bold">SIMULATE TOGGLES</h1>
            <ToggleGroup
                type="multiple"
                value={value}
                onValueChange={(_, newValue) => {
                    setValue(newValue)
                }}
                className="flex flex-row  bg-primary-foreground"
            >
                <ToggleGroupItem
                    value="recasted"
                    className="items-center justify-center gap-2 w-full  "
                >
                    <span className="flex items-center gap-2">
                        <span>👀</span>
                        <span>Recasted</span>
                    </span>
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="liked"
                    className="items-center justify-center gap-2 w-full "
                >
                    <span className="flex items-center gap-2">
                        <span>❤️</span>
                        <span>Liked</span>
                    </span>
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="following"
                    className="items-center justify-center gap-2 w-full "
                >
                    <span className="flex items-center gap-2">
                        <span>👥</span>
                        <span>Following</span>
                    </span>
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="follower"
                    className="items-center justify-center gap-2 w-full "
                >
                    <span className="flex items-center gap-2">
                        <span>👤</span>
                        <span>Follower</span>
                    </span>
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    )
}