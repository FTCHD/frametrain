import { randomUUID } from 'crypto'
import type { Config, fieldTypes } from '..'
import template from '..'
import { SessionUserStateType } from '../functions/userState'

function renderReviewItems(config: Config, userState: SessionUserStateType) {
    if (config.fields.length > 6) {
        const [pt1, pt2] = [config.fields.slice(0, 5), config.fields.slice(5)]
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                flexDirection: 'row',
                width: '100%',
                height: '100%',
                fontSize: '0.55em'
            }}>
                <div style={{
                    display: 'flex',
                    background: '#11111199',
                    flexDirection: 'column',
                    width: '45%',
                    height: '100%',
                    padding: '0.5em'
                }}>
                    {pt1.map((inputField, index) => {
                        return (
                            <div key={randomUUID()} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                background: '#FFFFFF16',
                                padding: '0.3em 0.5em',
                                marginBottom: '0.5em'
                            }}>
                                <span>{index + 1}. {inputField.fieldName}</span>
                                <span>{userState.inputValues[index]}</span>
                            </div>

                        )
                    })}
                </div>
                <div style={{
                    display: 'flex',
                    background: '#11111199',
                    flexDirection: 'column',
                    width: '45%',
                    height: '100%',
                    padding: '0.5em'
                }}>
                    {pt2.map((inputField, index) => {
                        return (
                            <div key={randomUUID()} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                background: '#FFFFFF16',
                                padding: '0.1em 0.5em',
                                marginBottom: '0.5em'
                            }}>
                                <span>{index + 6}. {inputField.fieldName}</span>
                                <span>{userState.inputValues[index+5]}</span>
                            </div>

                        )
                    })}
                </div>
            </div>
        )
    }
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            fontSize: '0.55em'
        }}>
            <div style={{
                display: 'flex',
                background: '#11111199',
                flexDirection: 'column',
                width: '45%',
                height: '100%',
                padding: '0.5em'
            }}>
                {config.fields.map((inputField, index) => {
                    return (
                        <div key={randomUUID()} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            background: '#FFFFFF16',
                            padding: '0.1em 0.5em',
                            marginBottom: '0.5em'
                        }}>
                            <span>{index + 1}. {inputField.fieldName}</span>
                            <span>{userState.inputValues[index]}</span>
                        </div>

                    )
                })}
            </div>
        </div>
    )
}

export default function ReviewView(config: Config, userState: SessionUserStateType) {

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
                color: '#ffffff',
            }}
        >
            <h5>Review</h5>
            {renderReviewItems(config, userState)}
        </div>
    )
}