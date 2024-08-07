export default function SuccessView({ name }: { name: string }) {
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
                color: '#ffffff',
            }}
        >
            <span tw="my-2 p-2 ">
                The operation on <span tw="text-blue-500">{name}</span> was successful
            </span>
        </div>
    )
}
