import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'FrameTrain | Farcaster Frames Builder',
        short_name: 'FrameTrain',
        description:
            'Post your Frames to Warpcast, Supercast, or Nook with the no-code Frames builder from the future. Now available with integrated Neynar Frame Validation.',
        start_url: '/',
        display: 'standalone',
        background_color: '#e64225',
        theme_color: '#e64225',
        icons: [
            {
                'src': '/favicons/icon-192.png',
                'sizes': '192x192',
                'type': 'image/png',
            },
            {
                'src': '/favicons/icon-512.png',
                'sizes': '512x512',
                'type': 'image/png',
            },
        ],
    }
}