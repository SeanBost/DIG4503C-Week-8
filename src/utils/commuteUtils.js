const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const DAY_OF_WEEK = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

// Returns the next calendar Date for a given day key.
// If today is that day but the depart hour has already passed, returns next week's occurrence.
function getNextOccurrence(dayKey, departTime) {
  const target = DAY_OF_WEEK[dayKey];
  const now = new Date();
  const todayDow = now.getDay();
  let daysUntil = (target - todayDow + 7) % 7;

  if (daysUntil === 0) {
    const departHour = parseInt(departTime.split(':')[0], 10);
    if (now.getHours() >= departHour) daysUntil = 7;
  }

  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysUntil);
  return date;
}

// Finds the hourly period whose startTime matches the given date and "HH:00" time string.
// Parses the hour directly from the ISO string so the match is in the location's local
// timezone regardless of the browser's timezone (e.g. "2026-03-25T08:00:00-05:00" → 8).
function findPeriod(periods, date, timeStr) {
  const targetHour = parseInt(timeStr.split(':')[0], 10);
  const yyyy = date.getFullYear();
  const mm   = date.getMonth() + 1;
  const dd   = date.getDate();

  return periods.find(p => {
    // startTime format: "YYYY-MM-DDTHH:mm:ss±HH:MM"
    const [datePart, timePart] = p.startTime.split('T');
    const [pYear, pMonth, pDay] = datePart.split('-').map(Number);
    const pHour = parseInt(timePart.substring(0, 2), 10);
    return pYear === yyyy && pMonth === mm && pDay === dd && pHour === targetHour;
  }) ?? null;
}

// Returns an ordered array of commute forecast entries for each active day.
// Each entry: { dayLabel, date, departPeriod, returnPeriod }
export function buildCommuteForecast(periods, savedSchedule) {
  if (!periods || !savedSchedule) return [];

  return DAY_ORDER
    .filter(key => savedSchedule[key]?.active)
    .map(key => {
      const day = savedSchedule[key];
      const date = getNextOccurrence(key, day.depart);
      return {
        dayLabel: DAY_LABELS[key],
        date,
        departPeriod: findPeriod(periods, date, day.depart),
        returnPeriod: findPeriod(periods, date, day.return),
      };
    })
    .sort((a, b) => a.date - b.date);
}
