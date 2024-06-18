const ErrorView = (isDebug: boolean, debugText: string) => {
    if (isDebug) console.error(debugText)

    return (
        <div
            style={{
                fontFamily: 'Roboto',
                fontSize: '32px',
                color: 'white',
            }}
        >
            {isDebug
                ? debugText
                : 'An error occurred rendering the frame. Please contact the frame owner.'}
        </div>
    )
}

export default ErrorView
