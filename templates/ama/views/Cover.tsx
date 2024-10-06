import type { Config } from '..'
import { Input } from '@/sdk/components'

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
            <Input
                    type="text"
                    placeholder="Ask Me any question..."
                    
                    //onChange={(e) => {}}
                />
            Ask Me Anyting
            <p>Question</p>
            <p>{config.questions}</p>

            <p>Answer</p>
            <p>{config.answers}</p>
        </div>
    )
}
