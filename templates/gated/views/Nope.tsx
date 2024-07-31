import type { Config } from '..'

export default function NopeView({
    config,
    errors,
}: { config: Config; errors: { message: string; type: string; basic: boolean }[] }) {
    const error = errors[0]
    let message = 'Must '

    if (error.basic) {
        switch (error.type) {
            case 'ctx': {
                message += `${error.message} this frame`
                break
            }

            case 'wallets': {
                message += `have ${error.message} wallet connected`
                break
            }

            default: {
                message += `${error.message}`
                break
            }
        }
    }

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
            {message} to reveal
        </div>
    )
}
