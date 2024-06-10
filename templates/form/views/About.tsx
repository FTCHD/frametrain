import type { Config, fieldTypes } from '..'
import template from '..'

export default function AboutView(config: Config) {    
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                background: `${config.backgroundColor}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: '50px',
                color: '#ffffff',
            }}
        >
            {/* {config.fields[0].fieldName || template.initialConfig.fields} */}
            ABOUT
        </div>
    )
}
