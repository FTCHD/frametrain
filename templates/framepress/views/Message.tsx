import type { FC, ReactNode } from 'react'

type MessageProps = {
    children: ReactNode
}

const Message = (text: string) => {
    return (
        <div
            style={{
                fontFamily: 'Roboto',
                fontSize: '32px',
                color: 'white',
            }}
        >
            {text}
        </div>
    )
}

export default Message
