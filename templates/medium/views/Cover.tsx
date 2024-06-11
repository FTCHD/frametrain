import type { Article } from '../utils'

export default function CoverView({
    article,
    textColor,
    bgBlendMode
}: { article?: Article, textColor?: string, bgBlendMode?: string}) {

    let background = '#000'
    if (article?.metadata.image) {
        background = `url(${article.metadata.image})`
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
                opacity: '0.3',
                color: textColor || '#fff',
                backgroundColor: '#000',
                background: background,
                backgroundSize: '100% 100%',
                backgroundBlendMode: bgBlendMode || 'normal',
            }}
        >
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
                    textAlign: 'center',
                    opacity: '0.8',
                }}
            >{ article?.metadata.author ?? 'Paste your medium article link into the URL input' }
            </span>
        </div>
    )
}
