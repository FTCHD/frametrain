import type { Config } from '..'

export default function PaymentView(config: Config) {
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
            Used to display a list of support tokens and chains, with an input field like "op on
            eth" for the user to pay
        </div>
    )
}
