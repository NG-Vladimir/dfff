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

type Tab = 'graph' | 'settings';

function App() {
  const [tab, setTab] = useState<Tab>('graph');
  const [people, setPeople] = useState<Person[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedulePreview, setSchedulePreview] = useState<string>('');
  const [scheduleType, setScheduleType] = useState<'week' | 'month' | null>(null);
  const [viewMonth, setViewMonth] = useState(new Date());

  useEffect(() => {
    setPeople(loadPeople());
    setAssignments(loadAssignments());
  }, []);

  useEffect(() => {
    savePeople(people);
  }, [people]);

  useEffect(() => {
    saveAssignments(assignments);
  }, [assignments]);

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
    (dateKey: string, roleId: RoleId, personId: string) => {
      const filtered = assignments.filter(
        (a) => !(a.date === dateKey && a.roleId === roleId)
      );
      if (personId) filtered.push({ date: dateKey, roleId, personId });
      setAssignments(filtered);
    },
    [assignments]
  );

  const getAssignment = useCallback(
    (dateKey: string, roleId: RoleId) =>
      assignments.find((a) => a.date === dateKey && a.roleId === roleId)?.personId ?? '',
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
        for (const { roleId, personId } of dayAssignments) {
          const role = ROLES.find((r) => r.id === roleId)?.label ?? roleId;
          lines.push(`   • ${role}: ${getPersonName(personId)}`);
        }
      }
      return lines.length ? '🎵 График служения\n' + lines.join('\n') : 'Нет назначений на выбранный период.';
    },
    [assignments, people]
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

  const sendToTelegram = () => {
    if (!schedulePreview) return;
    window.open(`https://t.me/share/url?text=${encodeURIComponent(schedulePreview)}`, '_blank');
  };

  const closeSchedulePreview = () => {
    setScheduleType(null);
    setSchedulePreview('');
  };

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
            className={tab === 'settings' ? 'active' : ''}
            onClick={() => setTab('settings')}
          >
            Настройки
          </button>
        </nav>
      </header>

      <main className="main">
        {tab === 'settings' && (
          <section className="settings">
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

        {tab === 'graph' && (
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
                  const filled = ROLES.filter((r) => getAssignment(dateKey, r.id)).length;
                  const isSelected = selectedDate && toDateKey(selectedDate) === dateKey;
                  return (
                    <li key={dateKey}>
                      <button
                        type="button"
                        className={`day-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedDate(selectedDate?.toString() === date.toString() ? null : date)}
                      >
                        <span className="day-date">{formatDateShort(date)}</span>
                        {filled > 0 && <span className="day-badge">{filled}/{ROLES.length}</span>}
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
                  const filled = ROLES.filter((r) => getAssignment(dateKey, r.id)).length;
                  const isSelected = selectedDate && toDateKey(selectedDate) === dateKey;
                  return (
                    <li key={dateKey}>
                      <button
                        type="button"
                        className={`day-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedDate(selectedDate?.toString() === date.toString() ? null : date)}
                      >
                        <span className="day-date">{formatDateShort(date)}</span>
                        {filled > 0 && <span className="day-badge">{filled}/{ROLES.length}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            {!selectedDate && (
              <p className="hint">Выберите день, затем назначьте роли и людей</p>
            )}

            {selectedDate && (
              <section className="assignments-panel">
                <h3>
                  {formatDateRu(selectedDate)}
                  <button type="button" className="close-day" onClick={() => setSelectedDate(null)} aria-label="Закрыть">×</button>
                </h3>
                <p className="panel-hint">Назначьте человека на каждую роль</p>
                {ROLES.map((role) => (
                  <div key={role.id} className="role-row">
                    <label>{role.label}</label>
                    <select
                      value={getAssignment(toDateKey(selectedDate), role.id)}
                      onChange={(e) => setAssignment(toDateKey(selectedDate), role.id, e.target.value)}
                    >
                      <option value="">—</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </section>
            )}

            <div className="graph-actions">
              <button type="button" onClick={showWeekSchedule}>График на неделю</button>
              <button type="button" onClick={showMonthSchedule}>График за месяц</button>
            </div>
          </>
        )}

        {scheduleType && (
          <div className="schedule-modal">
            <div className="schedule-modal-content">
              <h3>{scheduleType === 'week' ? 'График на неделю' : 'График за месяц'}</h3>
              <pre className="schedule-text">{schedulePreview}</pre>
              <div className="schedule-modal-actions">
                <button type="button" className="btn-telegram" onClick={sendToTelegram}>
                  Отправить в Telegram
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
