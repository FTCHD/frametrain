export default function CoverView(obj: { function: string; args: string[] }) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: '50px',
                color: '#ffffff',
                gap: '20px',
            }}
        >
            <span>Welcome to Blockscan</span>
            <span style={{ fontSize: '30px' }}>Function: {obj.function}</span>
            {obj.args.length === 0 ? (
                <span style={{ fontSize: '30px' }}>No arguments</span>
            ) : (
                obj.args.map((arg, index) => (
                    <span key={index} style={{ fontSize: '20px' }}>
                        Argument {index + 1}: {arg}
                    </span>
                ))
            )}
            <span style={{ fontSize: '30px' }}>
                Enter the values of the arguments separated by commas
            </span>
        </div>
    )
}
