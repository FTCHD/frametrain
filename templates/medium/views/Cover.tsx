import type { Article } from '../utils'

export default function CoverView({
    article,
    bgColor,
    textColor,
    imageSize,
    textPosition,
    hideTitleAuthor
}: { article?: Article, bgColor?: string, textColor?: string, imageSize: number, textPosition: boolean, hideTitleAuthor:boolean}) {

    let titleFontSize = '80px'
    let authorFontSize = '40px'
    if (article && (article?.metadata?.title?.length ?? 0) + (article?.metadata?.author?.length ?? 0) > 80) {
        titleFontSize = '40px'
        authorFontSize = '20px'
    }

    console.log('textPosition', textPosition)

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
                backgroundColor: bgColor || '#000'
            }}
        >
            { article?.metadata.image &&
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: imageSize ? `${imageSize}%` : '40%',
                    opacity: textPosition ? '0.66' : '1'
                }}>
                    <img
                        src={article.metadata.image}
                        alt="."
                        style={{
                            objectFit: 'contain',
                        }}
                    />
                </div>
            }
            {
                // image is overlaid with text
                textPosition && !hideTitleAuthor &&
                <div style={{
                    display: 'flex',
                    position: 'absolute',
                    top: '8%',
                    right: '8%',
                    bottom: '8%',
                    left: '8%',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <span
                        style={{
                            fontFamily: 'Georgia',
                            fontSize: titleFontSize,
                            textAlign: 'center',
                            textWrap: 'balance',
                            margin: '0 auto'
                        }}
                    >{ article?.metadata.title ?? '' }
                    </span>
                    <span
                        style={{
                            fontFamily: 'Georgia',
                            fontSize: authorFontSize,
                            textAlign: 'center',
                            margin: '20px auto'
                        }}
                    >{ article?.metadata.author ?? 'Paste your medium article link into the URL input' }
                    </span>
                </div>
            }
            {
                // biome-ignore lint/complexity: <explanation>
                !textPosition && !hideTitleAuthor &&
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <span
                        style={{
                            fontFamily: 'Georgia',
                            fontSize: titleFontSize,
                            textAlign: 'center',
                            textWrap: 'balance',
                            margin: '12px auto'
                        }}
                    >{ article?.metadata.title ?? '' }
                    </span>
                    <span
                        style={{
                            fontFamily: 'Georgia',
                            fontSize: authorFontSize,
                            textAlign: 'center',
                            margin: '8px auto'
                        }}
                    >{ article?.metadata.author ?? 'Paste your medium article link into the URL input' }
                    </span>
                </div>
            }
        </div>
    )
}
