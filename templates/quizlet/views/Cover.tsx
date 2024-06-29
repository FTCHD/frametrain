import type { Config } from '..'

export default function CoverView({
    text,
    configuration,
}: {
    text?: string
    configuration?: Config['cover']['configuration']
}) {
    const description = (text ?? 'Description').split('\n')

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontSize: configuration?.fontSize || '50px',
                background: configuration?.backgroundColor || 'black',
            }}
        >
            <span
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: configuration?.textColor || 'white',
                    fontFamily: configuration?.fontFamily || 'Roboto',
                    opacity: '0.8',
                    fontStyle: configuration?.fontStyle || 'normal',
                }}
            >
                {description.map((d, i) => (
                    <span
                        key={i}
                        style={{
                            textAlign: 'center',
                            opacity: '0.8',
                            textWrap: 'balance',
                        }}
                    >
                        {d}
                    </span>
                ))}
            </span>
        </div>
    )
}
