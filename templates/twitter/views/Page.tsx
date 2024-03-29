
export default function PageView({ content, profile }: { content: string; profile: string }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                background: 'white',
                color: 'black',
                padding: '40px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    height: '60%',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {/* <span
                    style={{
                        background: 'red',
                        textAlign: 'center',
                        fontFamily: 'Roboto',
                        lineHeight: '1.5',
                        fontSize: '18px',
                        borderRadius: '10px',
                        padding: '10px',
                    }}
                > */}
                {/* <Markdown>{'# Hi, **Pluto**!'}</Markdown> */}
                {/* </span> */}
                CONTENT
            </div>

            <div
                style={{
                    display: 'flex',
                    height: '40%',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    fontSize: '10px',
                }}
            >
                Posted by
                <img
                    style={{ border: '8px solid rgba(255, 255, 255, 0.2)', borderRadius: '50%' }}
                    src={'https://unavatar.io/twitter/' + profile}
                    width="32px"
                    height="32px"
                    alt=""
                />
                {profile} on X.
            </div>
        </div>
    )
}
