'use server'
import type { BuildFrameData } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { fetchTopStories, fetchStory } from '../utils/api'
import StoryView from '../views/Story'

export default async function initial({ config, storage }: { config: Config, storage: Storage }): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants('Roboto')
    const topStoryIds = await fetchTopStories()
    const storyId = topStoryIds[0]
    const story = await fetchStory(storyId)

    const viewedStories = storage.viewedStories || []
    viewedStories.push(storyId)

    return {
        buttons: [
            { label: 'Visit', action: 'link', target: story.url },
            { label: 'Next' },
        ],
        fonts,
        component: StoryView(story),
        handler: 'story',
        storage: { ...storage, viewedStories },
        params: { currentIndex: 0 },
    }
}