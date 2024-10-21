export function relativeTime(milliseconds: number) {
    const now = Date.now()
    const elapsed = now - milliseconds

    const seconds = Math.floor(elapsed / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
        return `${days}d ago`
    }
    if (hours > 0) {
        return `${hours}h ago`
    }
    if (minutes > 0) {
        return `${minutes}m ago`
    }
    return `${seconds}s ago`
}
