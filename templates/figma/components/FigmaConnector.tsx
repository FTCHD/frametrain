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

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : !figmaAccessToken ? (
        <Button onClick={handleConnectFigma} variant="primary">
          Connect Figma Account
        </Button>
      ) : (
        <p>Figma Account Connected</p>
      )}
    </div>
  );
}
