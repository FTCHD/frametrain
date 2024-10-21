import { randomUUID } from 'node:crypto'
import type { CSSProperties } from 'react'
import type { Config } from '..'
import type { SessionUserStateType } from '../state'

function renderReviewItems(config: Config, userState: SessionUserStateType) {
    function renderFields(fields: any[], startIndex: number) {
        return (
            <div style={styles.column}>
                {fields.map((inputField, index) => (
                    <div key={randomUUID()} style={styles.field}>
                        <span>
                            {startIndex + index + 1}. {inputField.fieldName}
                        </span>
                        <span>{userState.inputValues[startIndex + index].value}</span>
                    </div>
                ))}
            </div>
        )
    }

    const styles: Record<string, CSSProperties> = {
        container: {
            display: 'flex',
            justifyContent: 'space-around',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            fontSize: '0.55em',
        },
        column: {
            display: 'flex',
            background: '#11111199',
            flexDirection: 'column',
            width: '45%',
            height: '100%',
            padding: '0.5em',
        },
        field: {
            display: 'flex',
            justifyContent: 'space-between',
            background: '#FFFFFF16',
            padding: '0.1em 0.5em',
            marginBottom: '0.5em',
        },
    }

    if (config.fields.length > 6) {
        const [pt1, pt2] = [config.fields.slice(0, 5), config.fields.slice(5)]
        return (
            <div style={styles.container}>
                {renderFields(pt1, 0)}
                {renderFields(pt2, 5)}
            </div>
        )
    }

    return <div style={styles.container}>{renderFields(config.fields, 0)}</div>
}

export default function ConfirmSubmitView(config: Config, userState: SessionUserStateType) {
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
            }}
        >
            <h5>Review</h5>
            {renderReviewItems(config, userState)}
        </div>
    )
}
