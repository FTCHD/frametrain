import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '../shadcn/ToggleGroup'

export default function MockOptionsToggle() {
    const [value, setValue] = useState<string[]>([])
    return (
        <div className="flex flex-col gap-3 justify-center items-center w-full">
            <h1 className="text-lg font-bold">SIMULATE TOGGLES</h1>
            <ToggleGroup
                type="multiple"
                value={value}
                onValueChange={(value) => setValue(value)}
                className="flex flex-row bg-[#171a1c]  font-semibold rounded-md"
            >
                <ToggleGroupItem
                    value="recasted"
                    className="items-center justify-center px-6 py-2 w-full hover:bg-[#636b74] "
                >
                    <span className="flex gap-2 items-center">
                        <span>👀</span>
                        <span className="text-base">Recasted</span>
                    </span>
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="liked"
                    className="items-center justify-center px-6 py-2 w-full hover:bg-[#636b74]"
                >
                    <span className="flex gap-2 items-center">
                        <span>❤️</span>
                        <span className="text-base">Liked</span>
                    </span>
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="following"
                    className="items-center justify-center px-6 py-2 w-full hover:bg-[#636b74]"
                >
                    <span className="flex gap-2 items-center">
                        <span>👥</span>
                        <span className="text-base">Following</span>
                    </span>
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="follower"
                    className="items-center justify-center px-6 py-2 w-full hover:bg-[#636b74]"
                >
                    <span className="flex gap-2 items-center">
                        <span>👤</span>
                        <span className="text-base">Follower</span>
                    </span>
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    )
}
