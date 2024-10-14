'use client';
import { Button } from '@/sdk/components';
import { useFigmaToken } from './FigmaTokenContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FigmaConnector() {
  const router = useRouter();
  const { figmaAccessToken, loading } = useFigmaToken();
  const [isConnecting, setIsConnecting] = useState(false); // To track connection state

  const handleConnectFigma = () => {
    setIsConnecting(true); // Set connecting state

    // Change cursor to 'wait'
    document.body.style.cursor = 'wait';

    const currentPage = window.location.href;
    router.push(`/api/auth/figma/signin?original_url=${encodeURIComponent(currentPage)}`);
  };

  const handleSignout = async () => {
    // Change cursor to 'wait'
    document.body.style.cursor = 'wait';

    await fetch('/api/auth/figma/signout', {
      method: 'POST'
    });

    // Refresh the page
    // biome-ignore lint/correctness/noSelfAssign: this is legit
    window.location.href = window.location.href;
  };

  return (
    <div>
      {loading || isConnecting ? (
        <p>Loading...</p>
      ) : !figmaAccessToken ? (
        <Button onClick={handleConnectFigma} variant="primary">
          Connect Figma Account
        </Button>
      ) : (
        <Button onClick={handleSignout} variant="secondary">
          Sign Out
        </Button>
      )}
    </div>
  );
}
