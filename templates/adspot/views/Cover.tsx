import type { Config, Storage } from '..'

export default function CoverView(config: Config, storage: Storage) {
    if (storage.currentAd.image) {
        return (
            <img
                src={`${process.env.NEXT_PUBLIC_CDN_HOST}/${storage.currentAd.image}`}
                alt="Current Ad"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        )
    }

    if (config.coverType === 'image' && config.cover.image) {
        return (
            <img
                src={`${process.env.NEXT_PUBLIC_CDN_HOST}/${config.cover.image}`}
                alt="Cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        )
    }

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: config.cover.backgroundColor,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Roboto',
                color: config.cover.textColor,
            }}
        >
            <h1 style={{ fontSize: '40px', fontWeight: 'bold' }}>{config.cover.title}</h1>
            {config.cover.subtitle && <h2 style={{ fontSize: '24px' }}>{config.cover.subtitle}</h2>}
        </div>
    )
}