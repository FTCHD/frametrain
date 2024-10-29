

export default function DynamicPage({
    searchParams,
}: {
    searchParams: { q?: string }
}) {
    // Get the q parameter or use a random default URL
    const defaultUrls = [
        'https://neynar.com',
        'https://x.com',
        'https://twitter.com',
        'https://google.com',
    ]
    const randomUrl = defaultUrls[Math.floor(Math.random() * defaultUrls.length)]
    const url = searchParams.q || randomUrl

    return (
        <iframe
            src={url}
            style={{
                width: '100vw',
                height: '100vh',
                border: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
            }}
            title="Dynamic Content"
        />
    )
}
