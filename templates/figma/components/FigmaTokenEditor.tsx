'use client'
import { Button, Input } from '@/sdk/components'
import { Info, Save, X } from 'lucide-react'
import { useState } from 'react'

type FigmaTokenEditorProps = {
    figmaPAT: string
    onChange: (figmaPAT: string) => void
    onCancel: () => void
}

export default function FigmaTokenEditor({ figmaPAT, onChange, onCancel }: FigmaTokenEditorProps) {
    const [newFigmaPAT, setNewFigmaPAT] = useState('')
    
    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Figma Personal Access Token (PAT)</h2>
            <p className="text-sm text-muted-foreground">
                A token is required to display your Figma designs.
            </p>
            <div className="flex items-center space-x-2">
                <Input
                    id="token"
                    type="password"
                    placeholder={
                        figmaPAT
                            ? 'Paste in your new Figma PAT'
                            : 'Paste in your Figma PAT to begin'
                    }
                    className="flex-1"
                    onChange={(e) => setNewFigmaPAT(e.target.value)}
                />
                <Button
                    onClick={() =>
                        window.open(
                            'https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens',
                            '_blank'
                        )
                    }
                    variant="link"
                >
                    <Info className="mr-1" />
                    Help
                </Button>
            </div>
            <div className="flex items-center space-x-2">
                <Button onClick={() => onChange(newFigmaPAT)}>
                    <Save className="mr-1" />
                    Save
                </Button>
                <Button onClick={() => onCancel()} variant="secondary">
                    <X className="mr-1" />
                    Cancel
                </Button>
            </div>
        </div>
    )
}
