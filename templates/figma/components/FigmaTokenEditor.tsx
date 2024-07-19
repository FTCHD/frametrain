import { Input } from '@/components/shadcn/Input'
import Link from 'next/link'
import { InfoIcon } from 'lucide-react'

const FIGMA_PAT_HELP =
    'https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens'

type FigmaTokenEditorProps = {
    figmaPAT: string
    onChange: (figmaPAT: string) => void
}

export default function FigmaTokenEditor({ figmaPAT, onChange }: FigmaTokenEditorProps) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Figma Personal Access Token (PAT)</h2>
            <p className="text-sm text-muted-foreground">
                A token is required to display your Figma designs.
            </p>
            <div className="flex items-center space-x-2">
                <div>{figmaPAT ? '✅' : '❌'}</div>
                <Input
                    id="token"
                    type="password"
                    placeholder={
                        figmaPAT ? 'Figma PAT is saved' : 'Paste in your Figma PAT to begin'
                    }
                    className="flex-1"
                    onChange={(e) => onChange(e.target.value)}
                />
                <Link href={FIGMA_PAT_HELP} className="flex" target="_blank">
                    <InfoIcon className="mr-2 h-4 w-4 self-center" />
                    Learn more
                </Link>
            </div>
        </div>
    )
}
