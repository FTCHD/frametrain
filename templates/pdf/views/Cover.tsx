import { dimensionsForRatio } from '@/lib/constants'

export default function CoverView({
    title,
    subtitle,
    backgroundColor,
    textColor,
}: { title: string; subtitle: string; backgroundColor?: string; textColor?: string }) {
    return (
        <div
            style={{
                width: dimensionsForRatio['1/1'].width + 'px',
                height: dimensionsForRatio['1/1'].height + 'px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'center',
                backgroundColor: backgroundColor || 'black',
                color: textColor || 'white',
            }}
        >
            <span
                style={{
                    fontFamily: 'Roboto',
                    fontSize: '48px',
                }}
            >
                {title ?? 'Title'}
            </span>
            <span
                style={{
                    fontFamily: 'Roboto',
                    fontSize: '24px',
                    opacity: '0.8',
                }}
            >
                {subtitle ?? 'Subtitle'}
            </span>
        </div>
    )
}
