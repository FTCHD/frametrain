
import { Progress } from '@/components/shadcn/Progress'

const FUNNY_MESSAGES = [
    "It's not always #000000 and #FFFFFF",
    'Deploying killer robots...',
    'Making the magic happen...',
    'Doing the thing...',
    'Calling the shots...',
    'Developers, developers, developers.',
    'Time is precious, waste it wisely!',
    'Low battery. Please charge.',
    'Waiting in line..',
    'Procedurally doing nothing...',
    'DO hold your breath ;)',
    'Breeding more bits...',
    'Changing brake fluid...',
    'Sending IP to FBI...',
]

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-10 md:px-20 bg-[#17101f]">
            <div className="flex flex-col justify-center items-center space-y-4 w-full">
                <Progress className="w-full max-w-lg h-4 bg-blue-500 animate-progress origin-left-right" />
                <h4 className="text-2xl font-bold text-primary">
                    {FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]}
                </h4>
            </div>
        </div>
    )
}
