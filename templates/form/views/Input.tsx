import type { Config } from '..'
import type { SessionUserStateType } from '../functions/userState'

export default function InputView(config: Config, userState: SessionUserStateType) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                background: config.backgroundColor,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: '50px',
                color: config.fontColor,
                boxSizing: 'border-box',
            }}
        >
            <div
                className="input-title"
                style={{
                    width: '65%',
                    display: 'flex',
                    paddingLeft: '0.75em',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                {config.fields[userState.inputFieldNumber].fieldName}
                <span style={{ paddingLeft: '1em', fontSize: '0.6em' }}>
                    {config.fields[userState.inputFieldNumber].fieldDescription}
                </span>
            </div>
            <div
                className="input-wrapper"
                style={{
                    width: '70%',
                    height: '22%',
                    border: '0.07em solid #EBEBEB',
                    borderRadius: '1em',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                {userState.inputValues[userState.inputFieldNumber]?.length > 0 ? (
                    <span className="data" style={{ fontSize: '0.9em', color: 'black' }}>
                        {userState.inputValues[userState.inputFieldNumber]}
                    </span>
                ) : (
                    <span className="example" style={{ fontSize: '0.7em' }}>
                        Example: {config.fields[userState.inputFieldNumber].fieldExample}
                    </span>
                )}
            </div>
            <div
                className="input-wrapper"
                style={{
                    backgroundColor: '#000000BF',
                    borderTopLeftRadius: '1em',
                    position: 'absolute',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    fontSize: '0.6em',
                    right: 0,
                    bottom: 0,
                    padding: '0.5em 0.5em 0.5em 0.8em',
                }}
            >
                Field:{' '}
                <span style={{ fontSize: '0.85em', marginLeft: '0.5em' }}>
                    {userState.inputFieldNumber + 1}/{userState.totalInputFieldNumber}
                </span>
            </div>
        </div>
    )
}
