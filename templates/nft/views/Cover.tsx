import BasicView from '@/sdk/views/BasicView'
import type { Config } from '../types'

const CoverView = (config: Config) => (
    <BasicView title={config.title} subtitle={config.description} background={config.coverImage} />
)

export default CoverView
