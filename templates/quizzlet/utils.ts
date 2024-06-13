import type { State } from '.'

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

// https://howtodoinjava.com/typescript/sets/
export class SetWithContentEquality<T> {
    private items: T[] = []
    private getKey: (item: T) => string
    constructor(getKey: (item: T) => string) {
        this.getKey = getKey
    }
    add(item: T): void {
        const key = this.getKey(item)
        if (!this.items.some((existing) => this.getKey(existing) === key)) {
            this.items.push(item)
        }
    }
    delete(item: T): void {
        const key = this.getKey(item)
        this.items = this.items.filter((existing) => this.getKey(existing) !== key)
    }

    has(item: T): boolean {
        return this.items.some((existing) => this.getKey(existing) === this.getKey(item))
    }
    values(): T[] {
        return [...this.items]
    }
}

// save values of user's answers, format: { userId: State['answers'][string] }
type UserAnswer = Record<string, State['answers'][string]>
export const localAnswers = new Set<State['answers'][string]>(
    // compare user's answers by userId
    // (ans) => Object.keys(ans)[0]
)
export const isDev = process.env.NODE_ENV === 'development'
