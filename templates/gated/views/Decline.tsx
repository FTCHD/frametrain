export default function DeclineView({ errors }: { errors: { message: string; type: string }[] }) {
    const error = errors[0]

    let message = 'Must '
    let withSuffix = true

    switch (error.type) {
        case 'ctx': {
            message += `${error.message} this frame`
            break
        }

        case 'wallets': {
            message += `have ${error.message} wallet connected`
            break
        }

        case 'have': {
            message += `have ${error.message}`
            break
        }

        case 'nft': {
            message = `${error.message} holders only`
            withSuffix = false
            break
        }

        case 'error': {
            message = `Failed to check validate requirements for ${error.message}`
            withSuffix = false
            break
        }

        default: {
            message += `${error.message}`
            break
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
            {message} {withSuffix ? ' to reveal' : ''}
        </div>
    )
}
