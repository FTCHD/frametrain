'use client'

import type { MenuItem } from '../types'
import BasicConfig from './config/Basic'
import Qna from './config/Qna'
import Questions from './config/Questions'
import ScreensConfig from './config/Screens'

type Props = {
    item: MenuItem
}

export default function ConfigItemWrapper({ item }: Props) {
    const renderForm = () => {
        switch (item.key) {
            case 'qna':
                return <Qna />
            case 'questions':
                return <Questions />

            case 'screens':
                return <ScreensConfig />

            default:
                return <BasicConfig />
        }
    }
    return <>{renderForm()}</>
}
