import type { Slide } from '../'

export default function CoverView(slide: Slide) {
    const title = slide?.title?.text
    const content = slide?.content?.text
    const backgroundProp: Record<string, string> = {}

    if (slide.background.value?.startsWith('#')) {
        backgroundProp['backgroundColor'] = slide.background.value
    } else {
        backgroundProp['backgroundImage'] = slide.background.value
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
                ...backgroundProp,
            }}
        >
            {slide.type === 'text' ? (
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
                                fontSize: slide?.aspectRatio === '1:1' ? '20px' : '30px',
                                padding: '20px',
                            }}
                        >
                            {content}
                        </span>
                    )}
                </div>
            ) : (
                <img
                    src={slide.image || 'https://via.placeholder.com/630'}
                    alt=""
                    style={{ objectFit: slide.objectFit, width: '100%', height: '100%' }}
                />
            )}
        </div>
    )
}
