'use client';
import { Button } from '@/sdk/components';
import { useFigmaToken } from './FigmaTokenContext';
import { useRouter } from 'next/navigation';

export default function FigmaTokenEditor() {
  const router = useRouter();
  const { figmaAccessToken, loading } = useFigmaToken();

  const handleConnectFigma = () => {
    const currentPage = window.location.href;
    router.push(`/api/auth/figma?original_url=${encodeURIComponent(currentPage)}`);
  };

  const handleSignout = async () => {
    await fetch('/api/auth/figma/signout', {
      method: 'POST'
    });

    // Refresh the page
    // biome-ignore lint/correctness/noSelfAssign: <explanation>
    window.location.href = window.location.href;
  };

  return (
    <div>
      {loading ? (
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
