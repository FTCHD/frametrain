import type { Config } from '..'
import template from '../'

export default function CoverView(config: Config) {
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
            {config.text || template.initialConfig.text}
        </div>
    )
}
