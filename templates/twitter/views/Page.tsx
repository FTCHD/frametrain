export default function PageView({ content, profile }: { content: string; profile: string }) {
    const paragraphs = content.split('\n').map((line) => line.trim())

    let fontSize = 2

    const numChars = content.length + 50 * paragraphs.length

    if (numChars < 50) {
        fontSize = 5.5
    } else if (numChars >= 50 && numChars < 100) {
        fontSize = 4.2
    } else if (numChars >= 100 && numChars < 150) {
        fontSize = 3.5
    } else if (numChars >= 150 && numChars < 200) {
        fontSize = 3
    } else if (numChars >= 200 && numChars < 250) {
        fontSize = 2.5
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#0f0c29',
                padding: '40px',
                paddingBottom: '0px',
            }}
        >
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '2rem',
                }}
            >
                {paragraphs.map((paragraph, i) => (
                    <p
                        key={i}
                        style={{
                            width: '100%',
                            fontFamily: 'Roboto',
                            color: 'white',
                            fontSize: `${fontSize}rem`,
                            fontWeight: 300,
                            overflowWrap: 'break-word',
                            wordWrap: 'break-word',
                            // this is needed as it doesn't break on the "@" character
                            // https://css-tricks.com/when-a-line-doesnt-break
                            wordBreak: 'break-all',
                        }}
                    >
                        {paragraph}
                    </p>
                ))}
            </div>

            <div
                style={{
                    minHeight: '15%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    gap: '10px',
                    color: 'white',
                }}
            >
                <img
                    style={{ border: '8px solid rgba(255, 255, 255, 0.2)', borderRadius: '50%' }}
                    src={'https://unavatar.io/twitter/' + profile}
                    width="56px"
                    height="56px"
                    alt="Twitter Profile"
                />
                {profile}
            </div>
        </div>
    )
}
