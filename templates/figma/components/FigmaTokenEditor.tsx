'use client'
import type { FrameTrainSession } from '@/auth'
import { Button, Input } from '@/sdk/components'
import { InfoIcon, SaveIcon, XIcon } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useState } from 'react'

export default function FigmaTokenEditor() {
  const { data: session } = useSession();

  const figmaAccessToken = (session as FrameTrainSession)?.figmaAccessToken;

  return (
    <div>
      {!figmaAccessToken ? (
        <Button onClick={() => signIn('figma')} variant="primary">
          Connect Figma Account
        </Button>
      ) : (
        <p>Figma Account Connected</p>
      )}
    </div>
  )
}
