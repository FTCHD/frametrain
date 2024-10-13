
/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: process.env.NEXT_PUBLIC_CDN_HOST.split('//')[1],
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    // error: Module not found: Can't resolve 'pino-pretty' in wagmi package
    // https://github.com/pinojs/pino/issues/688#issuecomment-2190022471
    webpack: (config) => {
        config.externals.push("pino-pretty", "encoding");
        return config;
    },
}

export default nextConfig;
