export type RoleId = 'leading' | 'keyboardist' | 'guitarist' | 'backup' | 'drummer' | 'bass';

export const ROLES: { id: RoleId; label: string; emoji: string }[] = [
  { id: 'leading', label: 'Ведущий', emoji: '🎤' },
  { id: 'keyboardist', label: 'Клавиши', emoji: '🎹' },
  { id: 'guitarist', label: 'Гитара', emoji: '🎸' },
  { id: 'backup', label: 'Back Vocal', emoji: '🎙️' },
  { id: 'drummer', label: 'Барабанщик', emoji: '🥁' },
  { id: 'bass', label: 'Бас', emoji: '🎵' },
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
