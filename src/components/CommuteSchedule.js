import { useState, useEffect } from 'react';
import './CommuteSchedule.css';

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const HOURS = [];
for (let h = 5; h <= 23; h++) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour12 = h === 12 ? 12 : h % 12;
  HOURS.push({ value: `${String(h).padStart(2, '0')}:00`, label: `${hour12}:00 ${suffix}` });
}

const WORKDAYS = new Set(['mon', 'tue', 'wed', 'thu', 'fri']);

function defaultSchedule() {
  return Object.fromEntries(
    DAYS.map(({ key }) => [key, {
      active: WORKDAYS.has(key),
      depart: '08:00',
      return: '17:00',
    }])
  );
}

function CommuteSchedule({ onChange, initialSchedule }) {
  const [schedule, setSchedule] = useState(initialSchedule ?? defaultSchedule);

  // Seed parent with the default schedule on mount so Save works without any interaction
  useEffect(() => { onChange?.(schedule); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function update(key, field, value) {
    const next = { ...schedule, [key]: { ...schedule[key], [field]: value } };
    setSchedule(next);
    onChange?.(next);
  }

  return (
    <section className="setup-section">
      <h2>Commute Schedule</h2>
      <div className="schedule-grid">
        {DAYS.map(({ key, label }) => {
          const day = schedule[key];
          return (
            <div key={key} className={`schedule-row${day.active ? '' : ' schedule-row--off'}`}>
              <input
                type="checkbox"
                id={`day-${key}`}
                checked={day.active}
                onChange={e => update(key, 'active', e.target.checked)}
              />
              <label className="day-label" htmlFor={`day-${key}`}>{label}</label>
              <div className="time-fields">
                <div className="time-field">
                  <label htmlFor={`depart-${key}`}>Depart</label>
                  <select
                    id={`depart-${key}`}
                    value={day.depart}
                    disabled={!day.active}
                    onChange={e => update(key, 'depart', e.target.value)}
                  >
                    {HOURS.map(h => (
                      <option key={h.value} value={h.value}>{h.label}</option>
                    ))}
                  </select>
                </div>
                <div className="time-field">
                  <label htmlFor={`return-${key}`}>Return</label>
                  <select
                    id={`return-${key}`}
                    value={day.return}
                    disabled={!day.active}
                    onChange={e => update(key, 'return', e.target.value)}
                  >
                    {HOURS.map(h => (
                      <option key={h.value} value={h.value}>{h.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CommuteSchedule;
