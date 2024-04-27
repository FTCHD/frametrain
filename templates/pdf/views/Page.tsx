
export default function PageView({
    slideUrl,
    sizes,
}: { slideUrl: string; sizes: { width: number; height: number } }) {
    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'stretch',
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(to right, #0f0c29, #302b63, #24243e)',
                color: '#000',
            }}
        >
            <img
                src={process.env.NEXT_PUBLIC_CDN_HOST + slideUrl}
                style={{ width: '100%', height: '100%' }}
                alt="Slide"
            />
        </div>
    )
}
