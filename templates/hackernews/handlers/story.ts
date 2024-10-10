'use server'

import type { BuildFrameData, FramePayloadValidated } from '@/lib/farcaster'
import { loadGoogleFontAllVariants } from '@/sdk/fonts'
import type { Config, Storage } from '..'
import { fetchTopStories, fetchStory, type Story } from '../utils/api'
import StoryView from '../views/story'

const BUTTON_INDEX_VISIT = 1

type HandlerParams = {
    body: FramePayloadValidated
    config: Config
    storage: Storage
    params: { currentIndex: number }
}

type StoryFrameData = BuildFrameData & {
    storage?: Storage
    params: { currentIndex: number }
}

type Weight = number
type FontStyle = string

type Font = {
    name: string
    data: ArrayBuffer
    weight: Weight
    style: FontStyle
}

async function createStoryFrame(
    story: Story,
    currentIndex: number,
    fonts: Font[]
): Promise<StoryFrameData> {
    return {
        buttons: [{ label: 'Visit', action: 'link', target: story.url }, { label: 'Next' }],
        fonts,
        aspectRatio: '1:1',
        component: StoryView(story),
        handler: 'story',
        params: { currentIndex },
    }
}

async function updateViewedStories(storage: Storage, storyId: number): Promise<Storage> {
    const viewedStories = storage.viewedStories || []
    if (!viewedStories.includes(storyId)) {
        viewedStories.push(storyId)
    }
    return { ...storage, viewedStories }
}

export default async function story({
    body,
    config,
    storage,
    params,
}: HandlerParams): Promise<StoryFrameData> {
    const fonts = await loadGoogleFontAllVariants('Roboto')
    const topStoryIds = await fetchTopStories()
    const buttonIndex = body.tapped_button.index
    let currentIndex = params.currentIndex

    if (buttonIndex === BUTTON_INDEX_VISIT) {
        const storyId = storage.viewedStories[currentIndex]
        const story = await fetchStory(storyId)
        return createStoryFrame(story, currentIndex, fonts)
    }

    // Next button
    currentIndex = (currentIndex + 1) % config.numberOfStories
    const storyId = topStoryIds[currentIndex]
    const story = await fetchStory(storyId)

    const updatedStorage = await updateViewedStories(storage, storyId)

    return {
        ...(await createStoryFrame(story, currentIndex, fonts)),
        storage: updatedStorage,
    }
}
