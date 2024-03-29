import type { FontStyle, FontWeight } from 'satori'

export async function loadGoogleFont(
    fontName: string,
    fontWeight: FontWeight,
    fontStyle: FontStyle
): Promise<ArrayBuffer> {
    const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(
        ' ',
        '+'
    )}:wght@${fontWeight}&display=swap`

    const response = await fetch(googleFontUrl)
    const cssText = await response.text()

    // Extract the font URL from the CSS text
    const fontUrlMatch = cssText.match(/src: url\((.*?)\)/)
    if (!fontUrlMatch) {
        throw new Error('Failed to extract font URL from CSS')
    }

    const fontUrl = fontUrlMatch[1]

    // Download the font file
    const fontResponse = await fetch(fontUrl)
    const fontArrayBuffer = await fontResponse.arrayBuffer()

    return fontArrayBuffer
}

export async function loadGoogleFontAllVariants(
    fontName: string
): Promise<Array<{ name: string; data: ArrayBuffer; weight: FontWeight; style: FontStyle }>> {
    const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(
        ' ',
        '+'
    )}:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`

    const response = await fetch(googleFontUrl)
    const cssText = await response.text()

    // Split the CSS text into individual @font-face rules
    const fontFaceRules = cssText.split('@font-face').slice(1)

    const fontPromises = []

    for (const rule of fontFaceRules) {
        // Extract the font properties from each rule
        const fontProperties = rule.split(';').map((prop) => prop.trim())

        let fontUrl = ''
        let fontWeight: FontWeight = 400
        let fontStyle: FontStyle = 'normal'

        for (const prop of fontProperties) {
            if (prop.startsWith('src:')) {
                fontUrl = prop.match(/url\((.*?)\)/)?.[1] || ''
            } else if (prop.startsWith('font-weight:')) {
                fontWeight = Number.parseInt(
                    prop.replace('font-weight:', '').trim(),
                    10
                ) as FontWeight
            } else if (prop.startsWith('font-style:')) {
                fontStyle = prop.replace('font-style:', '').trim() as FontStyle
            }
        }

        if (fontUrl) {
            const fontResponse = await fetch(fontUrl)
            const fontArrayBuffer = await fontResponse.arrayBuffer()

            fontPromises.push({
                name: fontName,
                data: fontArrayBuffer,
                weight: fontWeight,
                style: fontStyle,
            })
        }
    }

    return Promise.all(fontPromises)
}