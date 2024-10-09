'use server'
import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { fetchTopStories, fetchStory } from '../utils/api'
import StoryView from '../views/Story'

export default async function story({ 
    body, 
    config, 
    storage, 
    params 
}: { 
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: { currentIndex: number }
}): Promise<BuildFrameData> {
    const fonts = await loadGoogleFontAllVariants('Roboto')
    const topStoryIds = await fetchTopStories()
    const buttonIndex = body.tapped_button.index
    let currentIndex = params.currentIndex

    if (buttonIndex === 1) {
        // Visit button
        const storyId = storage.viewedStories[currentIndex]
        const story = await fetchStory(storyId)
        return {
            buttons: [
                { label: 'Visit', action: 'link', target: story.url },
                { label: 'Next' },
            ],
            fonts,
            component: StoryView(story),
            handler: 'story',
            params: { currentIndex },
        }
    } else {
        // Next button
        currentIndex = (currentIndex + 1) % config.numberOfStories
        const storyId = topStoryIds[currentIndex]
        const story = await fetchStory(storyId)

        const viewedStories = storage.viewedStories || []
        if (!viewedStories.includes(storyId)) {
            viewedStories.push(storyId)
        }

        return {
            buttons: [
                { label: 'Visit', action: 'link', target: story.url },
                { label: 'Next' },
            ],
            fonts,
            component: StoryView(story),
            handler: 'story',
            storage: { ...storage, viewedStories },
            params: { currentIndex },
        }
    }
}