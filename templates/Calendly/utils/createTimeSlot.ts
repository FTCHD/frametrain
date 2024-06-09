export function createTimeSlots(periods: any[]): string[] {
  const slots: string[] = [];

  for (const period of periods) {
    const seconds = Number.parseInt(period);
    slots.push(convertSecondsToTime(seconds));
  }

  return slots;
}

function convertSecondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutesDecimal = (seconds / 3600 - hours) * 60;
  const minutes = Math.floor(minutesDecimal);

  return (
    hours.toString().padStart(2, "0") +
    ":" +
    minutes.toString().padStart(2, "0")
  );
}
