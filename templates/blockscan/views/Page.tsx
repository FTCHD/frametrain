export default function PageView({
    result,
    index,
    name,
    total,
}: { result: string | null; index: number; name: string; total: number }) {
    const percentage = (index / total) * 100

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                textAlign: 'center',
                fontFamily: 'Roboto',
                color: '#ffffff',
            }}
        >
            <div
                style={{
                    fontSize: '50px',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    gap: '20px',
                    padding: '30px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                }}
            >
                <span tw="my-2 p-2 ">{name}</span>
                <span style={{ fontSize: '30px', color: '#A9A9A9' }}>{result || 'No result'}</span>
            </div>
            <div
                style={{
                    height: '10',
                    width: `${percentage}%`,
                    top: 0,
                    position: 'absolute',
                    left: 0,
                    backgroundColor: 'yellow',
                }}
            />
        </div>
    )
}
