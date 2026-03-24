import { useState, useEffect, useRef, useMemo } from 'react';
import './Home.css';
import LocationInput from '../components/LocationInput';
import CommuteSchedule from '../components/CommuteSchedule';
import WeatherCard from '../components/WeatherCard';
import { buildCommuteForecast } from '../utils/commuteUtils';

const STORAGE_KEY = 'commute_profile';

function Home({ onRegisterSave, onRegisterLoad, onSaveEnabledChange }) {
  const [location, setLocation] = useState(null); // { city, state }
  const [locationError, setLocationError] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [scheduleKey, setScheduleKey] = useState(0);
  const [forecast, setForecast] = useState(null);   // hourly periods array
  const [forecastLoading, setForecastLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);       // live schedule from CommuteSchedule
  const [savedSchedule, setSavedSchedule] = useState(null); // snapshot taken on Save
  const [hasSaved, setHasSaved] = useState(false);
  const [locationInputReady, setLocationInputReady] = useState(false);

  // Refs so save/load closures always see latest values without re-registering
  const locationRef = useRef(location);
  const scheduleRef = useRef(schedule);
  useEffect(() => { locationRef.current = location; }, [location]);
  useEffect(() => { scheduleRef.current = schedule; }, [schedule]);

  useEffect(() => {
    onRegisterSave?.(() => {
      const loc = locationRef.current;
      const sched = scheduleRef.current;
      if (!loc || !sched) return false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ location: loc, schedule: sched }));
      return true;
    });

    onRegisterLoad?.(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      let loc, sched;
      try {
        ({ location: loc, schedule: sched } = JSON.parse(raw));
      } catch {
        return false;
      }
      if (!loc || !sched) return false;
      setLocationError(null);
      setLocation(loc);
      setSchedule(sched);
      setSavedSchedule(sched);
      setHasSaved(true);
      setFormKey(k => k + 1);
      setScheduleKey(k => k + 1);
      return true;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onSaveEnabledChange?.(!!location);
  }, [location, onSaveEnabledChange]);

  function handleLocationSubmit(loc) {
    setLocationError(null);
    setLocation(loc);
    setHasSaved(true);
    if (schedule) setSavedSchedule(schedule);
  }

  function handleSave() {
    document.getElementById('commute-location-form')?.requestSubmit();
  }

  useEffect(() => {
    if (!location) return;
    let cancelled = false;

    async function fetchForecast() {
      setForecastLoading(true);
      setForecast(null);
      try {
        // Step 1: Geocode city → lat/lon
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location.city)}&count=25&language=en&format=json`
        );
        if (!geoRes.ok) throw new Error('Location search service is unavailable. Please try again.');

        const geoData = await geoRes.json();
        const match = (geoData.results || []).find(
          r => r.country_code === 'US' && r.admin1?.toLowerCase() === location.state.toLowerCase()
        );
        if (!match) throw new Error(`No results found for "${location.city}, ${location.state}". Please check your spelling and try again.`);

        const { latitude, longitude, name, admin1 } = match;

        // Step 2: Get forecast grid point
        const pointRes = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`);
        if (!pointRes.ok) throw new Error(`Could not retrieve forecast data for ${name}, ${admin1}. The weather service may not cover this location.`);

        const pointData = await pointRes.json();
        const hourlyUrl = pointData.properties?.forecastHourly;
        if (!hourlyUrl) throw new Error('Weather service returned an unexpected response. Please try again.');

        // Step 3: Fetch hourly forecast
        const forecastRes = await fetch(hourlyUrl);
        if (!forecastRes.ok) throw new Error('Could not retrieve the hourly forecast. Please try again.');

        const forecastData = await forecastRes.json();
        if (!cancelled) setForecast(forecastData.properties?.periods ?? []);
      } catch (err) {
        if (!cancelled) {
          setLocationError(err.message);
          setLocation(null);
          setFormKey(k => k + 1);
        }
      } finally {
        if (!cancelled) setForecastLoading(false);
      }
    }

    fetchForecast();
    return () => { cancelled = true; };
  }, [location]);

  const commuteForecast = useMemo(
    () => buildCommuteForecast(forecast, savedSchedule),
    [forecast, savedSchedule]
  );
  const activeCardCount = savedSchedule
    ? Math.max(1, Object.values(savedSchedule).filter(d => d.active).length)
    : 5;

  return (
    <main className="home">

      {/* Upper: weather display — only after first save */}
      {hasSaved && (
        <div className="weather-panel">
          <h2>Your Week's Commute Forecast in {location?.city?.replace(/\b\w/g, c => c.toUpperCase())}</h2>
          <div className={`weather-cards${activeCardCount < 5 ? ' weather-cards--centered' : ''}`}>
            {Array.from({ length: activeCardCount }, (_, i) => (
              <WeatherCard
                key={i}
                data={commuteForecast[i] ?? null}
                loading={forecastLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lower: setup inputs */}
      <div className="commute-setup">
        <div className="setup-panel">
          <CommuteSchedule key={scheduleKey} onChange={setSchedule} initialSchedule={schedule} />
          <div className="location-column">
            <LocationInput key={formKey} onSubmit={handleLocationSubmit} onInputChange={setLocationInputReady} initialValues={location} />
            <div className="setup-actions">
              <button className="action-btn" type="button" onClick={handleSave} disabled={forecastLoading || !locationInputReady}>Set Commute</button>
            </div>
          </div>
        </div>
        {locationError && <p className="setup-error">{locationError}</p>}
      </div>

    </main>
  );
}

export default Home;
