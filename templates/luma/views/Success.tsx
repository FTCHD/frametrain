export default function SuccessView(title: string) {
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
                fontSize: '100px',
                color: '#ffffff',
            }}
        >
            You registered for {title}!
        </div>
    )
}
