import type { MenuItem, NavBarItem } from './types'

export const choicesRepresentation: Record<'alpha' | 'numeric', { [key: number]: string }> = {
    alpha: {
        0: 'A',
        1: 'B',
        2: 'C',
        3: 'D',
    },
    numeric: {
        0: '1',
        1: '2',
        2: '3',
        3: '4',
    },
}

export function sidebarNavItems(obj: { tab: NavBarItem['key'] }): NavBarItem[]
export function sidebarNavItems(obj: {
    tab: NavBarItem['key']
    showOne: true
}): MenuItem
export function sidebarNavItems(obj: {
    tab: NavBarItem['key']
    showOne?: true
}): MenuItem | NavBarItem[] {
    const items: MenuItem[] = [
        {
            title: 'Basic',
            key: 'basic',
            description: 'Configure the basic settings of your quiz.',
        },
        {
            title: 'Screens',
            key: 'screens',
            description: 'Configure what shows up on both your start and end screens.',
        },
        {
            title: 'Question & Answer',
            key: 'qna',
            description: 'Configure the questions and answers that will be displayed on your quiz.',
        },
        {
            title: 'Questions',
            key: 'questions',
            description: 'Update or delete questions from your quiz.',
        },
    ]

    if (obj.showOne) {
        const item = items.filter((item) => item.key === obj.tab)[0]
        return item
    }

    const menu: NavBarItem[] = items.map((item) => ({
        ...item,
        active: item.key === obj.tab,
    }))

    return menu
}
