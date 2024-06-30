import type { Config } from '..'

export default function CoverView(config: Config, page: number = 0) {
    const title = config?.title?.text
    const content = config?.content?.text
    const showContent = (content && page !== 0) || (content && page === 0 && !title)

    /* Style Customization */
    // Background
    const background: any = {}

    switch (config.background?.type) {
        case 'color': {
            background['background'] = config.background.value // Covers gradients and solid colors at the same time
            break
        }
        case 'image':
            background['backgroundImage'] = config.background.value
    }

    /* Images */
    if (config?.images?.length && config?.type === 'image') {
        background['backgroundImage'] = `url(${config.images[page]})`
        background['backgroundRepeat'] = 'no-repeat'
        background['backgroundSize'] = '100% 100%'
        background['backgroundPosition'] = 'center'
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Inter',
                fontSize: '50px',
                color: '#1c1c1c',
                ...background,
            }}
        >
            {config.type === 'text' && (
                <>
                    {title && page === 0 && (
                        <h1
                            style={{
                                color: config.title.color,
                                fontFamily: config.title.font,
                                fontStyle: config.title.style,
                                fontWeight: config.title.weight,
                            }}
                        >
                            {config.title.text}
                        </h1>
                    )}

                    {showContent && (
                        <span
                            style={{
                                color: config.content.color,
                                fontFamily: config.content.font,
                                textAlign: config.content.align,
                                fontWeight: config.content.weight,
                                display: 'block',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                fontSize: '20px',
                                padding: '20px',
                            }}
                        >
                            {config.content.text[page - (title ? 1 : 0)]}
                        </span>
                    )}
                </>
            )}
        </div>
    )
}
