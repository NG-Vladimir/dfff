export type RoleId = 'leading' | 'guitarist' | 'keyboardist' | 'drummer' | 'backup';

export const ROLES: { id: RoleId; label: string }[] = [
  { id: 'leading', label: 'Ведущий' },
  { id: 'guitarist', label: 'Гитарист' },
  { id: 'keyboardist', label: 'Клавишный' },
  { id: 'drummer', label: 'Барабанщик' },
  { id: 'backup', label: 'Бэк вокал' },
];

export interface Person {
  id: string;
  name: string;
}

export interface Assignment {
  date: string; // YYYY-MM-DD
  roleId: RoleId;
  personId: string;
  slot?: number; // 0, 1, 2 — до 3 человек на роль
}
