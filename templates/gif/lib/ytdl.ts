'use server'
import ytdl from 'ytdl-core'

export async function getVideo(url: string) {
    const response = await fetch(url)
    const data = await response.arrayBuffer()
    return Buffer.from(data).toString('base64')
}

export async function getInfo(url) {
    const id = ytdl.getURLVideoID(url)
    const info = await ytdl.getInfo(id)
    const videoInfo = ytdl.chooseFormat(info.formats, {
        filter: (format) => format.qualityLabel == '360p' && format.videoCodec == 'avc1.42001E',
    })
    return JSON.stringify(videoInfo)
}
