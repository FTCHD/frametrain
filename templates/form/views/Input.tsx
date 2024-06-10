import type { Config, fieldTypes } from '..'
import template from '..'
import { SessionUserStateType } from '../functions/userState'

export default function InputView(config: Config, userState: SessionUserStateType) {
    if (!userState) {
        return
    }
    // console.log("STATE IS: ",userState)

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(120deg, #f6d365 0%, #fda085 40%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                fontFamily: 'Roboto',
                fontSize: '50px',
                color: '#FFF',
                boxSizing: 'border-box'
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
                {config.fields[userState.inputFieldNumber].fieldName || template.initialConfig.fields}
                <span style={{ paddingLeft: '1em', fontSize: '0.6em' }}>{config.fields[userState.inputFieldNumber].fieldDescription || template.initialConfig.fields}</span>
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
                {
                    userState.inputValues[userState.inputFieldNumber]?.length > 0 ?
                        <span className="data" style={{ fontSize: '0.9em', color: 'black' }}>{userState.inputValues[userState.inputFieldNumber]}</span>
                        :
                        <span className="example" style={{ fontSize: '0.9em' }}>{config.fields[userState.inputFieldNumber].fieldExample || template.initialConfig.fields}</span>
                }
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
                    right: '0',
                    bottom: '0',
                    padding: '0.5em 0.5em 0.5em 0.8em'
                }}
            >
                Field: <span style={{ fontSize: '0.85em', marginLeft: '0.5em' }}>{userState.inputFieldNumber + 1}/{userState.totalInputFieldNumber}</span>
            </div>
            {
                config.fields[userState.inputFieldNumber].isNecessary ?
                    (<div
                        className="input-wrapper"
                        style={{
                          backgroundColor: '#FFF',
                          color: 'red',
                          position: 'absolute',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          fontSize: '0.4em',
                          borderRadius: '0.5em',
                          left: '0.5em',
                          bottom: '0.5em',
                          padding: '0.3em 0.6em 0.3em 0.5em'
                        }}
                      >
                        * Necessary To Fill
                      </div>)
                        :
                        ''
                }
        </div>
    )
}
