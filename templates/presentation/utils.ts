import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'

export function createPDFPage(document: PDFDocumentProxy, page: number) {
    return new Promise((resolve, reject) => {
        if (!document || !page) return reject()
        document
            .getPage(page)
            .then((pageDocument: PDFPageProxy) => {
                resolve(pageDocument)
            })
            .catch((error: any) => reject(error))
    })
}

export async function getPDFDocument(path: string): Promise<PDFDocumentProxy> {
    const pdfJs = await import('pdfjs-dist')

    pdfJs.GlobalWorkerOptions.workerSrc =
        'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs'

    return new Promise((resolve, reject) => {
        pdfJs
            .getDocument(path)
            .promise.then((pdfDocument: PDFDocumentProxy) => {
                resolve(pdfDocument)
            })
            .catch(reject)
    })
}

export function renderPDFToCanvas(pageDocument: PDFPageProxy, canvas: HTMLCanvasElement) {
    return new Promise((resolve, reject) => {
        pageDocument
            .render({
                canvasContext: canvas.getContext('2d') as CanvasRenderingContext2D,
                viewport: pageDocument.getViewport({ scale: 2 }),
            })
            .promise.then(() => {
                resolve(canvas)
            })
    })
}

export default getPDFDocument
