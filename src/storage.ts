import type { Person, Assignment, RoleId } from './types';
import { supabase } from './supabase';

const KEY_PEOPLE = 'worship-people';
const KEY_ASSIGNMENTS = 'worship-assignments';

function loadFromLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveToLocal(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export async function loadPeople(): Promise<Person[]> {
  if (supabase) {
    const { data, error } = await supabase.from('people').select('*').order('name');
    if (!error && data) return data as Person[];
  }
  return loadFromLocal<Person>(KEY_PEOPLE);
}

export async function savePeople(people: Person[]): Promise<void> {
  if (supabase) {
    await supabase.from('people').upsert(people.map((p) => ({ id: p.id, name: p.name })), {
      onConflict: 'id',
    });
    return;
  }
  saveToLocal(KEY_PEOPLE, people);
}

export async function loadAssignments(): Promise<Assignment[]> {
  if (supabase) {
    const { data, error } = await supabase.from('assignments').select('*');
    if (!error && data) {
      return (data as { date: string; role_id: string; person_id: string; slot?: number }[]).map(
        (a) => ({ date: a.date, roleId: a.role_id as RoleId, personId: a.person_id, slot: a.slot ?? 0 })
      );
    }
  }
  const loaded = loadFromLocal<Assignment>(KEY_ASSIGNMENTS);
  return loaded.map((a) => ({ ...a, slot: a.slot ?? 0 }));
}

export async function saveAssignments(assignments: Assignment[]): Promise<void> {
  if (supabase) {
    await supabase.from('assignments').delete().gte('date', '2000-01-01');
    const toInsert = assignments
      .filter((a) => a.personId)
      .map((a) => ({
        date: a.date,
        role_id: a.roleId,
        person_id: a.personId,
        slot: a.slot ?? 0,
      }));
    if (toInsert.length > 0) {
      await supabase.from('assignments').insert(toInsert);
    }
    return;
  }
  saveToLocal(KEY_ASSIGNMENTS, assignments);
}
