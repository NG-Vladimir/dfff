import { useState, useEffect, useCallback } from 'react';
import { ROLES, type Person, type Assignment, type RoleId } from './types';
import { loadPeople, savePeople, loadAssignments, saveAssignments } from './storage';
import {
  getServiceDatesInWeek,
  getServiceDatesInMonth,
  getTuesdaysInMonth,
  getSundaysInMonth,
  toDateKey,
  formatDateRu,
  formatDateShort,
} from './utils';
import './App.css';

function getSlotsForRole(roleId: string): number {
  return roleId === 'backup' ? 3 : 1;
}

type Tab = 'graph' | 'participants';

function App() {
  const [tab, setTab] = useState<Tab>('graph');
  const [people, setPeople] = useState<Person[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedulePreview, setSchedulePreview] = useState<string>('');
  const [scheduleType, setScheduleType] = useState<'week' | 'month' | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, a] = await Promise.all([loadPeople(), loadAssignments()]);
      setPeople(p);
      setAssignments(a);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    savePeople(people);
  }, [people, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveAssignments(assignments);
  }, [assignments, loaded]);

  const addPerson = () => {
    const name = newPersonName.trim();
    if (!name) return;
    if (people.some((p) => p.name.toLowerCase() === name.toLowerCase())) return;
    setPeople([...people, { id: crypto.randomUUID(), name }]);
    setNewPersonName('');
  };

  const removePerson = (id: string) => {
    setPeople(people.filter((p) => p.id !== id));
    setAssignments(assignments.filter((a) => a.personId !== id));
  };

  const setAssignment = useCallback(
    (dateKey: string, roleId: RoleId, slot: number, personId: string) => {
      const filtered = assignments.filter(
        (a) => !(a.date === dateKey && a.roleId === roleId && (a.slot ?? 0) === slot)
      );
      if (personId) filtered.push({ date: dateKey, roleId, personId, slot });
      setAssignments(filtered);
    },
    [assignments]
  );

  const getAssignmentsForRole = useCallback(
    (dateKey: string, roleId: RoleId): string[] => {
      const slots = getSlotsForRole(roleId);
      const items = assignments
        .filter((a) => a.date === dateKey && a.roleId === roleId)
        .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));
      const result: string[] = [];
      for (let i = 0; i < slots; i++) {
        result.push(items.find((a) => (a.slot ?? 0) === i)?.personId ?? '');
      }
      return result;
    },
    [assignments]
  );

  const getPersonName = (id: string) => people.find((p) => p.id === id)?.name ?? '—';

  const buildScheduleText = useCallback(
    (dates: { date: Date; label: string }[]) => {
      const lines: string[] = [];
      for (const { date, label } of dates) {
        const dateKey = toDateKey(date);
        const dayAssignments = assignments.filter((a) => a.date === dateKey);
        if (dayAssignments.length === 0) continue;
        lines.push(`\n📅 ${label} ${formatDateRu(date)}:`);
        for (const role of ROLES) {
          const personIds = getAssignmentsForRole(dateKey, role.id).filter(Boolean);
          if (personIds.length === 0) continue;
          const names = personIds.map((id) => getPersonName(id)).join(', ');
          lines.push(`   • ${role.label}: ${names}`);
        }
      }
      return lines.length ? '🎵 График служения\n' + lines.join('\n') : 'Нет назначений на выбранный период.';
    },
    [assignments, people, getAssignmentsForRole]
  );

  const showWeekSchedule = () => {
    const dates = getServiceDatesInWeek(new Date());
    setSchedulePreview(buildScheduleText(dates));
    setScheduleType('week');
  };

  const showMonthSchedule = () => {
    const now = new Date();
    const dates = getServiceDatesInMonth(now.getFullYear(), now.getMonth());
    setSchedulePreview(buildScheduleText(dates));
    setScheduleType('month');
  };

  const sendToTelegram = async () => {
    if (!schedulePreview) return;
    setSendStatus('sending');
    try {
      const base = window.location.origin;
      const res = await fetch(`${base}/api/send-telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: schedulePreview }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSendStatus('ok');
        setTimeout(() => setSendStatus('idle'), 3000);
      } else {
        const msg = data?.error || 'Ошибка отправки';
        setSendStatus('error');
        setTimeout(() => setSendStatus('idle'), 5000);
        if (msg.includes('не настроен') || msg.includes('TELEGRAM')) {
          navigator.clipboard.writeText(schedulePreview).catch(() => {});
          window.open('https://t.me/+WtexZQK41bc4MTYy', '_blank');
        }
        alert(msg);
      }
    } catch (e) {
      setSendStatus('error');
      setTimeout(() => setSendStatus('idle'), 5000);
      navigator.clipboard.writeText(schedulePreview).catch(() => {});
      window.open(`https://t.me/share/url?text=${encodeURIComponent(schedulePreview)}`, '_blank');
    }
  };

  const closeSchedulePreview = () => {
    setScheduleType(null);
    setSchedulePreview('');
    setSendStatus('idle');
  };

  const filledCount = useCallback(
    (dateKey: string) => {
      let count = 0;
      for (const role of ROLES) {
        count += getAssignmentsForRole(dateKey, role.id).filter(Boolean).length;
      }
      return count;
    },
    [getAssignmentsForRole]
  );

  const tuesdays = getTuesdaysInMonth(viewMonth.getFullYear(), viewMonth.getMonth());
  const sundays = getSundaysInMonth(viewMonth.getFullYear(), viewMonth.getMonth());
  const monthLabel = viewMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  const prevMonth = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1));
  const nextMonth = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1));

  return (
    <div className="app">
      <header className="header">
        <h1>График служения,</h1>
        <nav className="nav">
          <button
            className={tab === 'graph' ? 'active' : ''}
            onClick={() => { setTab('graph'); setSelectedDate(null); setScheduleType(null); }}
          >
            График
          </button>
          <button
            className={tab === 'participants' ? 'active' : ''}
            onClick={() => setTab('participants')}
          >
            Участники
          </button>
        </nav>
      </header>

      <main className="main">
        {tab === 'participants' && (
          <section className="participants-section">
            <h2>Участники</h2>
            <div className="add-name" onClick={() => document.getElementById('add-name-input')?.focus()}>
              <button type="button" className="add-btn" onClick={addPerson} aria-label="Добавить">
                +
              </button>
              <input
                id="add-name-input"
                type="text"
                placeholder="Добавить участника"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPerson()}
              />
            </div>
            {people.length > 0 && (
              <ul className="people-list">
                {people.map((p) => (
                  <li key={p.id}>
                    <span>{p.name}</span>
                    <button className="remove-btn" onClick={() => removePerson(p.id)}>×</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'graph' && !selectedDate && (
          <>
            <div className="month-nav">
              <button type="button" onClick={prevMonth}>←</button>
              <span className="month-label">{monthLabel}</span>
              <button type="button" onClick={nextMonth}>→</button>
            </div>

            <section className="days-section">
              <h3>Вторники</h3>
              <ul className="days-list">
                {tuesdays.map((date) => {
                  const dateKey = toDateKey(date);
                  const count = filledCount(dateKey);
                  return (
                    <li key={dateKey}>
                      <button
                        type="button"
                        className="day-item"
                        onClick={() => setSelectedDate(date)}
                      >
                        <span className="day-date">{formatDateShort(date)}</span>
                        {count > 0 && (
                          <span className="day-badge">{count}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="days-section">
              <h3>Воскресенья</h3>
              <ul className="days-list">
                {sundays.map((date) => {
                  const dateKey = toDateKey(date);
                  const count = filledCount(dateKey);
                  return (
                    <li key={dateKey}>
                      <button
                        type="button"
                        className="day-item"
                        onClick={() => setSelectedDate(date)}
                      >
                        <span className="day-date">{formatDateShort(date)}</span>
                        {count > 0 && (
                          <span className="day-badge">{count}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <div className="graph-actions">
              <button type="button" onClick={showWeekSchedule}>График на неделю</button>
              <button type="button" onClick={showMonthSchedule}>График за месяц</button>
            </div>
          </>
        )}

        {tab === 'graph' && selectedDate && (
          <div className="day-drilldown">
            <div className="day-drilldown-header">
              <button type="button" className="back-btn" onClick={() => setSelectedDate(null)}>
                ← Назад
              </button>
              <h2>{formatDateRu(selectedDate)}</h2>
              <p className="drilldown-hint">Бэк вокал: до 3 человек, остальные роли: 1 человек</p>
            </div>
            <div className="day-drilldown-content">
              {ROLES.map((role) => (
                <div key={role.id} className="role-block">
                  <label className="role-label">{role.label}</label>
                  <div className="role-slots">
                    {Array.from({ length: getSlotsForRole(role.id) }, (_, slot) => (
                      <select
                        key={slot}
                        value={getAssignmentsForRole(toDateKey(selectedDate), role.id)[slot] ?? ''}
                        onChange={(e) =>
                          setAssignment(toDateKey(selectedDate), role.id, slot, e.target.value)
                        }
                      >
                        <option value="">—</option>
                        {people.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {scheduleType && (
          <div className="schedule-modal">
            <div className="schedule-modal-content">
              <h3>{scheduleType === 'week' ? 'График на неделю' : 'График за месяц'}</h3>
              <pre className="schedule-text">{schedulePreview}</pre>
              <div className="schedule-modal-actions">
                {sendStatus === 'ok' && <span className="send-toast success">Отправлено!</span>}
                {sendStatus === 'error' && <span className="send-toast error">Не отправлено. Скопируйте вручную.</span>}
                <button
                  type="button"
                  className="btn-telegram"
                  onClick={sendToTelegram}
                  disabled={sendStatus === 'sending'}
                >
                  {sendStatus === 'sending' ? 'Отправка…' : 'Отправить в группу'}
                </button>
                <button type="button" className="btn-close" onClick={closeSchedulePreview}>
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
