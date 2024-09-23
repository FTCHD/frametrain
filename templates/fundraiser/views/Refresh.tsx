export default function RefreshView(failed = false) {
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
                    color: failed ? 'red' : 'rgb(32,32,32)',
                    fontWeight: 600,
                    fontSize: 24,
                }}
            >
                {failed
                    ? 'Sorry, we could not get the transaction data for your donation.'
                    : 'Waiting for payment confirmation..'}
            </div>
        </div>
    )
}
