export default function PageView() {
    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'stretch',
                width: '600px',
                height: '400px',
                backgroundImage: 'linear-gradient(to right, #0f0c29, #302b63, #24243e)',
                color: '#000',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flex: '1 0',
                    flexFlow: 'row nowrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <img
                    style={{ border: '8px solid rgba(255, 255, 255, 0.2)', borderRadius: '50%' }}
                    src="https://placehold.co/240x240?text=Hello+World"
                    width="240"
                    height="240"
                    alt="animals"
                />
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '6px',
                    padding: '12px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    fontSize: '22px',
                }}
            >
                Show Page
            </div>
        </div>
    )
}
