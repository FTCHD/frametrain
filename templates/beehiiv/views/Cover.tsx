import type { BeehiivArticle } from '../utils'

export default function CoverView({
    article,
    bgColor,
    textColor,
    imageSize,
    textPosition,
    hideTitleAuthor,
}: {
    article?: BeehiivArticle
    bgColor?: string
    textColor?: string
    imageSize: number
    textPosition: boolean
    hideTitleAuthor: boolean
}) {
    let titleFontSize = '40px'
    let authorFontSize = '20px'
    console.log('old size >> metadata', article?.metadata)
    if (
        article &&
        (article?.metadata?.title?.length ?? 0) + (article?.metadata?.author?.length ?? 0) > 80
    ) {
        console.log('new sizes')
        titleFontSize = '25px'
        authorFontSize = '20px'
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: textColor || '#fff',
                backgroundColor: bgColor || '#000',
            }}
        >
            {article?.metadata.image && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: imageSize ? `${imageSize}%` : '40%',
                        opacity: textPosition ? '0.66' : '1',
                    }}
                >
                    <img
                        src={article.metadata.image}
                        alt="."
                        style={{
                            objectFit: 'contain',
                        }}
                    />
                </div>
            )}
            {
                // image is overlaid with text
                textPosition && !hideTitleAuthor && (
                    <div
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            top: '8%',
                            right: '8%',
                            bottom: '8%',
                            left: '8%',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: 'Georgia',
                                fontSize: titleFontSize,
                                textAlign: 'center',
                                textWrap: 'balance',
                                margin: '0 auto',
                            }}
                        >
                            {article?.metadata.title ?? ''}
                        </span>
                        <span
                            style={{
                                fontFamily: 'Georgia',
                                fontSize: authorFontSize,
                                textAlign: 'center',
                                margin: '8px auto',
                                opacity: '0.8',
                            }}
                        >
                            {article?.metadata.subtitle}
                        </span>
                        {article?.metadata.author ? (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    opacity: '0.8',
                                    // color: config.secondaryColor || '#ffffff',
                                }}
                            >
                                {/* <div>{post.pubDate}</div> */}

                                <div
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                    }}
                                >
                                    {article.metadata.author}
                                </div>
                            </div>
                        ) : (
                            <span
                                style={{
                                    fontFamily: 'Georgia',
                                    fontSize: authorFontSize,
                                    textAlign: 'center',
                                    margin: '20px auto',
                                }}
                            >
                                Paste your beehiv article link into the URL input
                            </span>
                        )}
                    </div>
                )
            }
            {
                // biome-ignore lint/complexity: <explanation>
                !textPosition && !hideTitleAuthor && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: 'Georgia',
                                fontSize: titleFontSize,
                                textAlign: 'center',
                                textWrap: 'balance',
                                margin: '12px auto',
                            }}
                        >
                            {article?.metadata.title ?? ''}
                        </span>
                        <span
                            style={{
                                fontFamily: 'Georgia',
                                fontSize: '15px',
                                textAlign: 'center',
                                margin: '8px auto',
                                opacity: '0.8',
                            }}
                        >
                            {article?.metadata.subtitle}
                        </span>

                        <span
                            style={{
                                fontFamily: 'Georgia',
                                fontSize: authorFontSize,
                                textAlign: 'center',
                                margin: '8px auto',
                            }}
                        >
                            {article?.metadata.author ??
                                'Paste your beehiv article link into the URL input'}
                        </span>
                    </div>
                )
            }
        </div>
    )
}
