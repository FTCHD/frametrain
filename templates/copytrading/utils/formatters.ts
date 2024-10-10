/**
 * Formats a number or string as currency.
 * @param value - The value to format (number or string representation of a number)
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns A formatted currency string
 */
export function formatCurrency(
    value: number | string,
    currency: string = 'USD',
    locale: string = 'en-US'
): string {
    // Convert string to number if necessary
    const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value

    // Check if the value is a valid number
    if (isNaN(numericValue)) {
        return 'Invalid Amount'
    }

    // Format the number as currency
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericValue)
}

/**
 * Formats a number as a percentage.
 * @param value - The value to format (number or string representation of a number)
 * @param decimalPlaces - The number of decimal places to show (default: 2)
 * @returns A formatted percentage string
 */
export function formatPercentage(value: number | string, decimalPlaces: number = 2): string {
    // Convert string to number if necessary
    const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value

    // Check if the value is a valid number
    if (isNaN(numericValue)) {
        return 'Invalid Percentage'
    }

    // Format the number as a percentage
    return `${(numericValue * 100).toFixed(decimalPlaces)}%`
}

/**
 * Truncates a string to a specified length and adds an ellipsis if truncated.
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the string (default: 20)
 * @returns The truncated string
 */
export function truncateString(str: string, maxLength: number = 20): string {
    if (str.length <= maxLength) {
        return str
    }
    return str.slice(0, maxLength - 3) + '...'
}

/**
 * Formats a number to a specified number of decimal places.
 * @param value - The value to format (number or string representation of a number)
 * @param decimalPlaces - The number of decimal places to show (default: 2)
 * @returns A formatted number string
 */
export function formatNumber(value: number | string, decimalPlaces: number = 2): string {
    // Convert string to number if necessary
    const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value

    // Check if the value is a valid number
    if (isNaN(numericValue)) {
        return 'Invalid Number'
    }

    // Format the number
    return numericValue.toFixed(decimalPlaces)
}
