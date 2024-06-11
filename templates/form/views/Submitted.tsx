import type { Config } from '..'

export default function SubmittedView(config: Config) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                background: config.backgroundColor,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: '50px',
                color: config.fontColor,
            }}
        >
            <div
                style={{
                    width: '60%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    fontFamily: 'Roboto',
                    fontSize: '30px',
                    color: '#ffffff',
                }}
            >
                Submitted Before! If you continue, you would overwrite the form!
            </div>
            {/* {config.fields[0].fieldName || template.initialConfig.fields} */}
        </div>
    )
}
