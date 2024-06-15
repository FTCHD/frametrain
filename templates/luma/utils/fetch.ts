'use server'
export async function fetchData(url: string) {
    const res = await fetch(url)
    const html = await res.text()

    return html
}
