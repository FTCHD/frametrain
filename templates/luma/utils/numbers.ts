export function formatAmount(cents: number, currency = 'usd') {
    const parser = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    })

    return parser.format(cents / 100)
}
