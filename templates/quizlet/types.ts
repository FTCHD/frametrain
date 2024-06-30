export type MenuItem = {
    title: string
    description: string
    key: 'cover' | 'ending' | 'questions' | 'qna' | 'basic'
}

export type NavBarItem = MenuItem & {
    active: boolean
}
