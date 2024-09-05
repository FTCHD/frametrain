'use client'

import { Separator } from '@/sdk/components'
import { useState } from 'react'
import ConfigItemWrapper from './components/ConfigItemWrapper'
import NavBar from './components/Navbar'
import type { NavBarItem } from './types'
import { sidebarNavItems } from './utils'

export default function Inspector() {
    const [activeTab, setActiveTab] = useState<NavBarItem['key']>('basic')

    const tab = sidebarNavItems({ tab: activeTab, showOne: true })

    return (
        <>
            <div className="flex flex-col gap-5 w-full h-full">
                <div className="flex flex-row gap-4 w-full">
                    <NavBar items={sidebarNavItems({ tab: activeTab })} setActive={setActiveTab} />
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <h2 className="text-2xl font-medium">{tab.title}</h2>
                    <p className="text-sm text-muted-foreground">{tab.description}</p>
                    <Separator />
                </div>
                <ConfigItemWrapper item={sidebarNavItems({ tab: activeTab, showOne: true })} />
            </div>
        </>
    )
}
