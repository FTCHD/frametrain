import type { Article } from '../utils'

export default function CoverView({
    article,
    bgColor,
    textColor,
    hideTitleAuthor
}: { article?: Article, bgColor?: string, textColor?: string, hideTitleAuthor:boolean}) {

    let titleFontSize = '80px'
    let authorFontSize = '40px'
    if (article && (article?.metadata?.title?.length ?? 0) + (article?.metadata?.author?.length ?? 0) > 80) {
        titleFontSize = '40px'
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
                gap: '100px',
                padding: '70px',
                opacity: '0.8',
                color: textColor || '#fff',
                backgroundColor: bgColor || '#000'
            }}
        >
            { article?.metadata.image &&
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50px', // testing sizes to stay under 256kb limit
                    margin: '20px 0 0 0',
                    overflow: 'hidden',
                }}>
                    <img
                        src={article.metadata.image}
                        alt="."
                        style={{
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </div>
            }
            {
                !hideTitleAuthor &&
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
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
        </div>
    )
}
