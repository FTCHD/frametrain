import type { Slide } from '../types'

export default function CoverView(slide: Slide) {
    const title = slide?.title?.text
    const content = slide?.content?.text

    /* Style Customization */
    // Background
    const background: any = {}

    switch (slide.background?.type) {
        case 'color': {
            background['background'] = slide.background.value // Covers gradients and solid colors at the same time
            break
        }
        case 'image':
            background['backgroundImage'] = slide.background.value
    }

    /* Images */
    if (slide?.image && slide.type === 'image') {
        background['backgroundImage'] = `url(${slide.image})`
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
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: '#1c1c1c',
                ...background,
            }}
        >
            {(!slide.image || slide.type === 'text') && (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    {title && (
                        <h1
                            style={{
                                color: slide?.title?.color,
                                fontFamily: slide?.title?.font,
                                fontStyle: slide?.title?.style,
                                fontWeight: slide?.title?.weight,
                                fontSize: content ? '35px' : '60px',
                            }}
                        >
                            {title}
                        </h1>
                    )}

                    {content && (
                        <span
                            style={{
                                color: slide?.content?.color,
                                fontFamily: slide?.content?.font,
                                textAlign: slide?.content?.align,
                                fontWeight: slide?.content?.weight,
                                display: 'block',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                fontSize: slide?.aspect === '1:1' ? '20px' : '30px',
                                padding: '20px',
                            }}
                        >
                            {content}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
