import type { FontStyle, FontWeight } from "satori"

export default class FontConfig {
    fontFamily: string
    fontWeight: FontWeight
    fontStyle: FontStyle
    key: string

    constructor(fontFamily: string, fontWeight: string, fontStyle: string) {
        this.fontFamily = fontFamily
        this.fontWeight = this.mapFontWeight(fontWeight)
        this.fontStyle = (fontStyle as FontStyle) || 'normal'
        this.key = `${this.fontFamily}::${this.fontWeight}:${this.fontStyle}`
    }

    private mapFontWeight(fontWeight: string): FontWeight {
        const weightMap: { [key: string]: FontWeight } = {
            'normal': 400,
            'bold': 700,
            'bolder': 900,
            'lighter': 100,
            '100': 100,
            '200': 200,
            '300': 300,
            '400': 400,
            '500': 500,
            '600': 600,
            '700': 700,
            '800': 800,
            '900': 900,
            'thin': 100,
            'extra-light': 200,
            'light': 300,
            'regular': 400,
            'medium': 500,
            'semi-bold': 600,
            'extra-bold': 800,
            'black': 900,
            'heavy': 900,
        }
        return weightMap[fontWeight] || 400 // Default to 400 if not found
    }
}
