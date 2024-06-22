export type MenuItem = {
    title: string
    description: string
    key: 'screens' | 'questions' | 'qna' | 'basic'
}

export type NavBarItem = MenuItem & {
    active: boolean
}
