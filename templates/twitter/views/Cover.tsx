export default function CoverView(config: {
    title: Record<string, string>
    profile: string
    bottom: Record<string, string>
    background?: string
}) {
    const { title, profile, bottom, background } = config

    const backgroundProp = {}

    if (background) {
        if (background?.startsWith('#')) {
            backgroundProp['backgroundColor'] = background
        } else {
            backgroundProp['backgroundImage'] = background
        }
    } else {
        backgroundProp['backgroundColor'] = '#0f0c29'
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                // alignItems: 'center',
                padding: '40px',
                ...backgroundProp,
            }}
        >
            <span
                style={{
                    width: '100%',
                    height: '80%',
                    fontFamily: title?.fontFamily || 'Roboto',
                    color: title?.color || 'white',
                    fontSize: '7rem',
                    overflow: 'hidden',
                    fontWeight: title?.fontWeight || '300',
                    paddingRight: '20px',
                }}
            >
                {title?.text}
            </span>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '2rem',
                    gap: '10px',
                    color: 'white',
                }}
            >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img
                        style={{
                            border: '8px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                        }}
                        src={'https://unavatar.io/twitter/' + profile}
                        width="56px"
                        height="56px"
                        alt="Twitter Profile"
                    />
                    {profile}
                </div>
                {!!bottom?.text && (
                    <span
                        style={{
                            fontFamily: 'Roboto',
                            fontWeight: '500',
                            color: bottom?.color || 'white',
                        }}
                    >
                        {bottom.text}
                    </span>
                )}
            </div>
        </div>
    )
}
