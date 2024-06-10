import type { Config, fieldTypes } from '..'
import template from '..'

export default function SuccessView(config: Config) {

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
            {/* {config.fields[0].fieldName || template.initialConfig.fields} */}
            Success
        </div>
    )
}
