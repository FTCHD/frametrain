export function formatAmount(cents: number, currency = 'usd') {
    const parser = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    })

    return parser.format(cents / 100)
}

export function formatHosts(hosts: string[]): string {
    if (hosts.length === 0) {
        return 'UNKNOWN HOST'
    }
    if (hosts.length === 1) {
        return hosts[0]
    }
    if (hosts.length <= 4) {
        return hosts.join(', ').replace(/, ([^,]*)$/, ' & $1')
    }
    return `${hosts.slice(0, 3).join(', ')}, & ${hosts.length - 3} others`
}
