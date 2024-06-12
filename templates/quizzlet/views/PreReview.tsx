import type { Config } from '..'

export default function PreReviewAnswersView(config: Config) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: '50px',
                color: '#ffffff',
            }}
        >
            {config.beforeReview?.screen || 'Click to start reviewing your answers'}
        </div>
    )
}
