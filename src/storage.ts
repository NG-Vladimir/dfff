import type { Person, Assignment } from './types';

const KEY_PEOPLE = 'worship-people';
const KEY_ASSIGNMENTS = 'worship-assignments';

export function loadPeople(): Person[] {
  try {
    const raw = localStorage.getItem(KEY_PEOPLE);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function savePeople(people: Person[]): void {
  localStorage.setItem(KEY_PEOPLE, JSON.stringify(people));
}

export function loadAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(KEY_ASSIGNMENTS);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveAssignments(assignments: Assignment[]): void {
  localStorage.setItem(KEY_ASSIGNMENTS, JSON.stringify(assignments));
}
