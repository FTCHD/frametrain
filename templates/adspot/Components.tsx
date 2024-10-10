export const UserProfile = ({
    description,
    image,
}: {
    description: string
    image?: string
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px',
                fontSize: 32, // Match the font size of the description text
                border: '1px solid rgb(221, 221, 221)',
                padding: '8px',
                borderRadius: '32px',
                lineHeight: '36px',
            }}
        >
            {image && (
                // biome-ignore lint/a11y/useAltText: <explanation>
                <img
                    src={image}
                    style={{
                        width: '36px', // Set width to match text height
                        height: '36px', // Set height to match text height
                        borderRadius: '50%',
                        objectFit: 'cover',
                        verticalAlign: 'middle', // Align the image with the text baseline
                    }}
                />
            )}
            <span>{description}</span>
        </div>
    )
}

export const FooterColumn = ({
    title,
    children,
}: {
    title: string
    children: any
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
            }}
        >
            <span
                style={{
                    fontSize: 23,
                    fontWeight: 600,
                    color: 'black',
                    opacity: 0.8,
                }}
            >
                {title}
            </span>
            {children}
        </div>
    )
}

export const InfoBox = ({ label, title }: { label: string; title: string }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: '16px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '16px',
                    flex: 1,
                }}
            >
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            color: 'black',
                        }}
                    >
                        <span
                            style={{
                                lineHeight: '20px',
                                fontSize: '23px',
                                opacity: 0.5,
                            }}
                        >
                            {title}
                        </span>
                        <span
                            style={{
                                fontWeight: '600',
                                fontSize: '36px',
                                lineHeight: '40px',
                            }}
                        >
                            {label}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
