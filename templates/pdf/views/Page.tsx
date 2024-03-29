
export default function PageView({
    content,
    sizes,
    profile,
}: { content: string; sizes: { width: number; height: number }; profile?: string }) {
    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'stretch',
                width: sizes.width + 'px',
                height: sizes.height + 'px',
                backgroundImage: 'linear-gradient(to right, #0f0c29, #302b63, #24243e)',
                color: '#000',
            }}
        >
            <img src={content} style={{ width: '100%', height: '100%' }} alt="" />
        </div>
    )
}
