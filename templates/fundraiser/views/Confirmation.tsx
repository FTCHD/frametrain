export default function ConfirmationView({ amount }: { amount: string }) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: 44,
                flexDirection: 'column',
                flexGrow: 1,
                padding: 32,
                textAlign: 'left',
                alignItems: 'center',
                height: '100%',
                backgroundColor: 'rgb(255,255,255)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexGrow: 1,
                    padding: 32,
                    textAlign: 'center',
                    color: 'rgb(131,131,131)',
                    fontWeight: 600,
                    fontSize: 50,
                }}
            >
                You are about to donate {amount}
            </div>
        </div>
    )
}
