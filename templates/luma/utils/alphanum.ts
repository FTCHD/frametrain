export function formatAmount(cents: number, currency = 'usd') {
    const parser = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    })

    return parser.format(cents / 100)
}

/**
 * A function that takes the list of hosts and returns a string
 * If the list is empty, it should return 'UNKNOWN HOST'
 * If the list has one host, it should return the host's name
 * If the list has up to  four hosts, it should return a comma-separated list of the hosts' names with an '&' before the last name
 * If the list has more than four hosts, it should return a comma-separated list of the first three hosts' names with an '&' then the number of remaining hosts suffixed with 'others'
 *
 * @example [ 'Natalia Bielczyk, PhD', 'Atal Agarwal', 'Pianpian Xu guthrie', 'Steve' ] => 'Natalia Bielczyk, PhD, Atal Agarwal, Pianpian Xu guthrie, Steve'
 *
 * @param {string[]} hosts - The list of hosts
 * @returns {string} - The formatted string
 */
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
