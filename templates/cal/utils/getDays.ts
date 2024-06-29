export function getCurrentAndFutureDate(days: number) {
    const formatDate = (date: any) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based, so we add 1
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const currentDate = new Date()
    const futureDate = new Date()
    futureDate.setDate(currentDate.getDate() + days)

    const formattedCurrentDate = formatDate(currentDate)
    const formattedFutureDate = formatDate(futureDate)

    return [formattedCurrentDate, formattedFutureDate]
}
