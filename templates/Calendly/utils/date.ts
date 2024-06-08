export function getNextSixDates(): string[] {
  const today = new Date();
  const dates: string[] = [];

  dates.push(today.getDate().toString());

  for (let i = 1; i <= 6; i++) {
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + i);
    dates.push(nextDate.getDate().toString());
  }

  return dates;
}
