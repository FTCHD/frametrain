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
    console.log('bgBlendMode', bgBlendMode)

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
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <span
                        style={{
                            fontFamily: 'Georgia',
                            fontSize: '80px',
                            textAlign: 'center',
                            textWrap: 'balance',
                            margin: '0 auto'
                        }}
                    >{ article?.metadata.title ?? '' }
                    </span>
                    <span
                        style={{
                            fontFamily: 'Georgia',
                            fontSize: '40px',
                            textAlign: 'center'
                        }}
                    >{ article?.metadata.author ?? 'Paste your medium article link into the URL input' }
                    </span>
                </div>
            }
        </div>
    )
}
