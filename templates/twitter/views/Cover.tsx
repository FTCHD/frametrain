
export default function CoverView({ title, profile }: { title: string; profile: string }) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundImage: 'linear-gradient(to right, #0f0c29, #302b63, #24243e)',
                padding: '40px',
            }}
        >
            <span
                style={{
                    fontFamily: 'Roboto',
                    color: 'black',
                    fontSize: '48px',
                }}
            >
                {title}
            </span>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '24px',
                    gap: '10px',
                }}
            >
                A thread by
                <img
                    style={{ border: '8px solid rgba(255, 255, 255, 0.2)', borderRadius: '50%' }}
                    src={'https://unavatar.io/twitter/' + profile}
                    width="48px"
                    height="48px"
                    alt="animals"
                />
                @{profile}
            </div>
        </div>
    )
}
