function sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

/**
 * @name triggerEvent
 *
 * A function that sends webhook info based on the event type and the data.
 * It sends a POST request to the webhook url.
 * There's a limit of 3 tries at an interval of 5 seconds each
 *
 * @param event {name: string, webhookUrl: string } - an object of the event name and external url
 * @param data object - data to be sent with the event
 * @returns Promise<void>
 */
async function triggerEvent(
    event: { name: string; webhookUrl: string },
    data: Record<string, unknown>
) {
    const id = crypto.randomUUID()

    for (let i = 0; i <= 3; i++) {
        try {
            const response = await fetch(event.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    event: event.name,
                    data: {
                        ...data,
                        createdAt: new Date().toISOString(),
                    },
                }),
            })
            console.log(
                `[triggerEvent|OK] >> Successfully sent event data to ${event.webhookUrl} for ${event.name}`
            )

            return response
        } catch (error) {
            console.log(`[triggerEvent|ERROR] >> failed to send data to ${event.webhookUrl}`, error)

            if (i < 3) {
                console.log(`[triggerEvent|ERROR] >> Retry ${i + 1}/3 after 5 seconds...`)
                await sleep(5)
            } else {
                console.log('[triggerEvent|ERROR] >> Retry failed')
            }
        }
    }
}

class FrameError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'FrameError'
    }
}

export { FrameError, triggerEvent }
