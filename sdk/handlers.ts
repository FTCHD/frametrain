

class FrameError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'FrameError'
    }
}

export { FrameError }