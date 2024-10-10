export default function StoryView(story: any) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1e1e1e',
                padding: '10px',
                fontFamily: 'Verdana, Geneva, sans-serif',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    backgroundColor: '#ff6600',
                    borderRadius: '20px',
                    padding: '30px',
                    width: '95%',
                    height: '85%',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        fontSize: '48px',
                        color: '#1e1e1e',
                        opacity: 0.5,
                    }}
                >
                    "
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        zIndex: 1,
                        maxWidth: '90%',
                    }}
                >
                    <h1
                        style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: '#1e1e1e',
                            margin: 0,
                            lineHeight: 1.3,
                        }}
                    >
                        {story.title}
                    </h1>
                    <p
                        style={{
                            fontSize: '18px',
                            color: '#1e1e1e',
                            margin: 0,
                        }}
                    >
                        {story.score} points by {story.by}
                    </p>
                </div>
                <div
                    style={{
                        display: 'flex',
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        fontSize: '48px',
                        color: '#1e1e1e',
                        opacity: 0.5,
                    }}
                >
                    "
                </div>
            </div>
        </div>
    )
}
