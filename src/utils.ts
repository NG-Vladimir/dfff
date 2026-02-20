const DAY_TUESDAY = 2;
const DAY_SUNDAY = 0;

export function isPastDate(d: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dNorm = new Date(d);
  dNorm.setHours(0, 0, 0, 0);
  return dNorm < today;
}

export function getServiceDatesInWeek(date: Date): { date: Date; label: string }[] {
  const result: { date: Date; label: string }[] = [];
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1); // Monday
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    d.setHours(0, 0, 0, 0);
    if (d < today) continue; // прошедшие дни не показываем
    if (d.getDay() === DAY_TUESDAY || d.getDay() === DAY_SUNDAY) {
      result.push({
        date: d,
        label: d.getDay() === DAY_TUESDAY ? 'Вторник' : 'Воскресенье',
      });
    }
  }
  return result;
}

export function getServiceDatesInMonth(year: number, month: number): { date: Date; label: string }[] {
  const result: { date: Date; label: string }[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    if (!isPastDate(d) && (d.getDay() === DAY_TUESDAY || d.getDay() === DAY_SUNDAY)) {
      result.push({
        date: new Date(d),
        label: d.getDay() === DAY_TUESDAY ? 'Вторник' : 'Воскресенье',
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return result;
}

export function getTuesdaysInMonth(year: number, month: number): Date[] {
  const result: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    if (d.getDay() === DAY_TUESDAY && !isPastDate(d)) result.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return result;
}

export function getSundaysInMonth(year: number, month: number): Date[] {
  const result: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    if (d.getDay() === DAY_SUNDAY && !isPastDate(d)) result.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return result;
}

export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatDateRu(d: Date): string {
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(d: Date): string {
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}
