import type { Config } from '..'

export default function CoverView(config: Config) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: '50px',
                color: '#ffffff',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    padding: '30px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                }}
            >
                <span style={{ textAlign: 'center', fontSize: '20px' }}>
                    {config.cover?.title || 'Cover Title'}
                </span>
                <span style={{ textAlign: 'center', fontSize: '10px' }}>
                    {config.cover?.description || 'Cover Description'}
                </span>
            </div>

            <div
                style={{
                    height: '10',
                    width: `${(1 / 3) * 100}%`,
                    top: 0,
                    position: 'absolute',
                    left: 0,
                    backgroundColor: config.cover?.barColor || 'yellow',
                }}
            />
        </div>
    )
}
