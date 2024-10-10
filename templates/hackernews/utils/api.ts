export interface Story {
    id: number
    title: string
    url: string
    score: number
    by: string
    time: number
}

function isValidTopStoriesResponse(data: unknown): data is number[] {
    return Array.isArray(data) && data.every(item => typeof item === 'number');
}

export async function fetchTopStories(limit: number = 100): Promise<number[]> {
    try {
        const response = await fetch(
            'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty'
        )
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (!isValidTopStoriesResponse(data)) {
            throw new TypeError('Unexpected response format')
        }
        return data.slice(0, limit)
    } catch (error) {
        console.error('Error fetching top stories:', error)
        throw error
    }
}

function isValidStory(data: unknown): data is Story {
    return typeof data === 'object' && data !== null && 'id' in data;
}

export async function fetchStory(id: number): Promise<Story> {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Invalid story ID')
    }

    try {
        const response = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
        )
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (!isValidStory(data)) {
            throw new TypeError('Unexpected response format')
        }
        return data
    } catch (error) {
        console.error(`Error fetching story ${id}:`, error)
        throw error
    }
}