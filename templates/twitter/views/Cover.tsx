
export default function CoverView(config: {
    title: string
    profile: string
    rightText?: string
}) {
    const { title, profile, rightText } = config

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                // alignItems: 'center',
                // backgroundImage: 'linear-gradient(to right, #0f0c29, #302b63, #24243e)',
                backgroundColor: '#0f0c29',
                padding: '40px',
            }}
        >
            <span
                style={{
                    width: '100%',
                    height: '70%',
                    fontFamily: 'Roboto',
                    color: 'white',
                    fontSize: '7rem',
                    overflow: 'hidden',
                    fontWeight: 300,
                }}
            >
                {title}
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
                {rightText}
            </div>
        </div>
    )
}
