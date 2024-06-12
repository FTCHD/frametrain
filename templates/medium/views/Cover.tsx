import type { Article } from '../utils'

export default function CoverView({
    article,
    textColor,
    bgBlendMode,
    hideTitleAuthor
}: { article?: Article, textColor?: string, bgBlendMode?: string, hideTitleAuthor:boolean}) {

    let background = '#000'
    if (article?.metadata.image) {
        background = `url(${article.metadata.image})`
    }

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
                backgroundColor: '#000',
                background: background,
                backgroundSize: '100% 100%'
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: '0',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    opacity: bgBlendMode == 'lighten' || bgBlendMode == 'darken'? '0.4' : '0',
                    backgroundColor: bgBlendMode == 'lighten' ? '#fff' : bgBlendMode == 'darken' ? '#000' : 'transparent'
                }}>

            </div>
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
