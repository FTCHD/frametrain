import BasicView from '@/sdk/views/BasicView'
import type { Config } from '../types'

const SuccessView = (config: Config) => (
    <BasicView
        title={config.successTitle || 'Transaction Successful!'}
        subtitle={config.successSubtitle || 'Thank you for using our marketplace.'}
        background={config.successBackground || config.coverImage}
    />
)

export default SuccessView
