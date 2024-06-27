import type { Config } from '..'
import template from '..'

export default function CoverView(config: Config) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                justifyContent: 'space-between',
                backgroundColor: 'white',
                display: 'flex',
                fontFamily: 'Roboto',
                fontSize: '50px',
                padding: '50px',
            }}
        >
            <span
                style={{
                    width: '100%',
                    height: '80%',
                    fontFamily: 'Roboto',
                    color: 'black',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    fontSize: '40px',
                    overflow: 'hidden',
                    fontWeight: '300',
                    paddingRight: '15px',
                }}
            >
                Repo Owner: {config.to}
                <span style={{fontSize: '30px'}}>
                    Token Address: {config.tokenAddress}
                </span>
                <span style={{fontSize: '30px'}}>
                    Your contribution will help the project develop further
                </span>
            </span>
        </div>
    )
}
