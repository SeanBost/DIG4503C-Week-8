import './WeatherCard.css';

function PeriodSlot({ label, period }) {
  if (!period) {
    return (
      <div className="wc-slot">
        <span className="wc-slot-label">{label}</span>
        <span className="wc-slot-null">—</span>
      </div>
    );
  }

  const hour = parseInt(period.startTime.substring(11, 13), 10);
  const suffix = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const time = `${hour12}:00 ${suffix}`;
  const temp = `${period.temperature}°${period.temperatureUnit}`;
  const precip = period.probabilityOfPrecipitation?.value ?? 0;

  return (
    <div className="wc-slot">
      <span className="wc-slot-label">{label}</span>
      <span className="wc-slot-time">{time}</span>
      <span className="wc-slot-data">{temp} · {precip}%</span>
    </div>
  );
}

function weatherIcon(departPeriod, returnPeriod) {
  const a = departPeriod?.probabilityOfPrecipitation?.value ?? 0;
  const b = returnPeriod?.probabilityOfPrecipitation?.value ?? 0;
  const sum = a + b;
  if (sum > 50) return '/resources/rain-img.png';
  if (sum >= 25) return '/resources/cloud-img.png';
  return '/resources/sun-img.png';
}

function WeatherCard({ data, loading }) {
  if (loading) {
    return (
      <div className="weather-card weather-card--loading">
        <span>Loading…</span>
      </div>
    );
  }

  if (!data) {
    return <div className="weather-card weather-card--placeholder" />;
  }

  const dateStr = data.date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const icon = weatherIcon(data.departPeriod, data.returnPeriod);

  return (
    <div className="weather-card">
      <div className="wc-header">
        <div className="wc-title">
          <img className="wc-icon" src={icon} alt="" />
          <span className="wc-day">{data.dayLabel}</span>
        </div>
        <span className="wc-date">{dateStr}</span>
      </div>
      <div className="wc-slots">
        <PeriodSlot label="Depart" period={data.departPeriod} />
        <PeriodSlot label="Return" period={data.returnPeriod} />
      </div>
    </div>
  );
}

export default WeatherCard;
