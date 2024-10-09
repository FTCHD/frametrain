import type { Config } from '..'

export default function CoverView(config: Config) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                background: config.backgroundColor,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: '50px',
                color: `${config.fontColor}`,
            }}
        >
            {config.coverText}
        </div>
    )
}
