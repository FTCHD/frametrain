'use server'
import ytdl from 'ytdl-core'

export async function getVideo(url: string) {
    let response = await fetch(url)
    let data = await response.arrayBuffer()
    return Buffer.from(data).toString('base64')
}

export async function getInfo(url) {
    let id = ytdl.getURLVideoID(url)
    let info = await ytdl.getInfo(id)
    let videoInfo = ytdl.chooseFormat(info.formats, {
        filter: (format) => format.qualityLabel == '360p' && format.videoCodec == 'avc1.42001E',
    })
    return JSON.stringify(videoInfo)
}
