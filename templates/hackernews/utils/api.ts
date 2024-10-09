export async function fetchTopStories(): Promise<number[]> {
    const response = await fetch(
        'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty'
    )
    return response.json()
}

export async function fetchStory(id: number): Promise<any> {
    const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
    )
    return response.json()
}
