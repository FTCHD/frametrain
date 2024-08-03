export default function FunctionView({
    signature,
    index,
    args,
    total,
}: { signature: string; index: number; args: string[]; total: number }) {
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
                    width: '100%',
                    fontSize: '50px',
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
                <span>Function #{index}</span>
                <span tw="rounded-md my-2 p-2 text-gray-100" style={{ fontSize: '30px' }}>
                    {signature}
                </span>
                {args.length === 0 ? (
                    <span style={{ fontSize: '30px' }}>No arguments</span>
                ) : (
                    <>
                        <span style={{ fontSize: '30px' }}>
                            Enter the values of the arguments separated by commas
                        </span>
                    </>
                )}
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
