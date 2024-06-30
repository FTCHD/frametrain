'use client'

import type { MenuItem } from '../types'
import BasicConfig from './config/Basic'
import EndingScreen from './config/EndingScreen'
import Qna from './config/Qna'
import Questions from './config/Questions'
import CoverScreen from './config/CoverScreen'

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

            case 'cover':
                return <CoverScreen />

            case 'ending':
                return <EndingScreen />

            default:
                return <BasicConfig />
        }
    }
    return <>{renderForm()}</>
}
