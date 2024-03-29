import { dimensionsForRatio } from '@/lib/constants'

export default function VoteView(question: string) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: dimensionsForRatio['1.91/1'].width + 'px',
                height: dimensionsForRatio['1.91/1'].height + 'px',
                backgroundImage: 'linear-gradient(to right, #0f0c29, #0b6bcb, #0f0c29)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: '900',
                }}
            >
                {question.toUpperCase()}
            </div>
        </div>
    )
}
