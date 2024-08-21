'use server'

type Meme = {
    id: string
    name: string
    url: string
    width: number
    height: number
    box_count: number
    captions: number
}

export async function getMemes() {
    try {
        const response = await fetch('https://api.imgflip.com/get_memes')
        const data = (await response.json()) as
            | {
                  success: true
                  data: {
                      memes: Meme[]
                  }
              }
            | {
                  success: false
                  error_message: string
              }

        if (!data.success) {
            console.error(`[imgFlip.getMemes] >> ${data.error_message}`, data)

            throw new Error(data.error_message)
        }

        return data.data.memes
    } catch (e) {
        console.error('[imgFlip.getMemes] >> Failed to fetch memes', e)
        throw {
            success: false,
            message: 'An error occurred while fetching meme templates',
        }
    }
}

export async function createMeme(captions: string[], id: string) {
    const url = new URL('https://api.imgflip.com/caption_image')
    url.searchParams.append('template_id', id)
    url.searchParams.append('username', process.env.IMGFLIP_USERNAME!)
    url.searchParams.append('password', process.env.IMGFLIP_PASSWORD!)

    captions.forEach((caption, index) => {
        url.searchParams.append(`boxes[${index}][text]`, caption)
    })

    try {
        const response = await fetch(url.toString(), {
            method: 'POST',
        })

        const data = (await response.json()) as
            | {
                  success: true
                  data: {
                      url: string
                      page_url: string
                  }
              }
            | { success: false; error_message: string }

        if (!data.success) {
            throw new Error(data.error_message)
        }

        return data.data.url
    } catch (e) {
        console.error('[imgFlip.createMeme] >> Failed to generate meme', e)
        throw {
            success: false,
            message: 'An error occurred while generating the meme',
        }
    }
}
