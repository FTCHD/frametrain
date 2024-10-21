import type { ChoiceField, TextField } from '..'

export default function FieldView(field: TextField | ChoiceField) {
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
            {field.type || 'no config'}
        </div>
    )
}
