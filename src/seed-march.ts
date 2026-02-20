import type { Person, Assignment } from './types';

// Детерминированные ID по имени
function id(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i) | 0;
  const hex = Math.abs(h).toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
}

export const MARCH_PEOPLE: Person[] = [
  { id: id('Алёна'), name: 'Алёна' },
  { id: id('Андрей'), name: 'Андрей' },
  { id: id('Элла'), name: 'Элла' },
  { id: id('Вениамин'), name: 'Вениамин' },
  { id: id('Вова'), name: 'Вова' },
  { id: id('Таня'), name: 'Таня' },
  { id: id('Эвелина'), name: 'Эвелина' },
  { id: id('Настя'), name: 'Настя' },
  { id: id('Ира'), name: 'Ира' },
  { id: id('Татьяна'), name: 'Татьяна' },
  { id: id('Алеся'), name: 'Алеся' },
];

const MARCH_DATA: { date: string; leading?: string; keyboardist?: string; drummer?: string; guitarist?: string }[] = [
  { date: '2026-03-01', leading: 'Алёна', keyboardist: 'Таня', drummer: 'Вова', guitarist: 'Алёна' },
  { date: '2026-03-03', leading: 'Андрей', keyboardist: 'Таня', drummer: 'Вова', guitarist: 'Андрей' },
  { date: '2026-03-08', leading: 'Элла', keyboardist: 'Таня', drummer: 'Вова', guitarist: 'Вениамин' },
  { date: '2026-03-10', leading: 'Алёна', keyboardist: 'Эвелина', drummer: 'Вова', guitarist: 'Алёна' },
  { date: '2026-03-15', leading: 'Андрей', keyboardist: 'Эвелина', drummer: 'Вова', guitarist: 'Андрей' },
  { date: '2026-03-17', leading: 'Настя', keyboardist: 'Татьяна', drummer: 'Вова', guitarist: 'Вениамин' },
  { date: '2026-03-22', leading: 'Элла', keyboardist: 'Эвелина', drummer: 'Вова', guitarist: 'Вениамин' },
  { date: '2026-03-24', leading: 'Алеся', keyboardist: 'Таня', drummer: 'Вова', guitarist: 'Вениамин' },
  { date: '2026-03-29', leading: 'Алеся', keyboardist: 'Таня', drummer: 'Вова', guitarist: 'Вениамин' },
  { date: '2026-03-31', leading: 'Элла', keyboardist: 'Эвелина', drummer: 'Вова', guitarist: 'Вениамин' },
];

// March 17: Ведущий — Настя, Ира (двое)
const MARCH_17_EXTRA = { leading2: 'Ира' };

export function buildMarchAssignments(): Assignment[] {
  const assignments: Assignment[] = [];
  for (const row of MARCH_DATA) {
    if (row.leading) assignments.push({ date: row.date, roleId: 'leading', personId: id(row.leading), slot: 0 });
    if (row.date === '2026-03-17' && MARCH_17_EXTRA.leading2) {
      assignments.push({ date: row.date, roleId: 'leading', personId: id(MARCH_17_EXTRA.leading2), slot: 1 });
    }
    if (row.keyboardist) assignments.push({ date: row.date, roleId: 'keyboardist', personId: id(row.keyboardist), slot: 0 });
    if (row.drummer) assignments.push({ date: row.date, roleId: 'drummer', personId: id(row.drummer), slot: 0 });
    if (row.guitarist) assignments.push({ date: row.date, roleId: 'guitarist', personId: id(row.guitarist), slot: 0 });
  }
  return assignments;
}
