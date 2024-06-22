import { Button } from '@/components/shadcn/Button'
import type { MenuItem } from '../types'

type Item = {
    title: string
    key: MenuItem['key']
    active: boolean
}

interface NavBarProps {
    items: Item[]
    setActive: (item: Item['key']) => void
}

export default function NavBar({ items, setActive }: NavBarProps) {
    return (
        <>
            {items.map((item) => (
                <Button
                    variant="ghost"
                    key={item.key}
                    className={`justify-start ${
                        item.active
                            ? 'bg-muted hover:bg-muted'
                            : 'hover:bg-transparent hover:underline'
                    }`}
                    onClick={() => setActive(item.key)}
                >
                    {item.title}
                </Button>
            ))}
        </>
    )
}
