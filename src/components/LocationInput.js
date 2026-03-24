import { useState, useEffect } from 'react';
import { normalizeState } from '../utils/normalizeState';
import './LocationInput.css';

const ALPHA_SPACE = /^[a-zA-Z .,']*$/;

function LocationInput({ onSubmit, onInputChange, initialValues }) {
  const [city, setCity] = useState(initialValues?.city ?? '');
  const [state, setState] = useState(initialValues?.state ?? '');

  // If pre-filled via initialValues, notify parent immediately
  useEffect(() => {
    if (initialValues?.city && initialValues?.state) onInputChange?.(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCity(e) {
    if (!ALPHA_SPACE.test(e.target.value)) return;
    setCity(e.target.value);
    onInputChange?.(!!e.target.value.trim() && !!state.trim());
  }

  function handleState(e) {
    if (!ALPHA_SPACE.test(e.target.value)) return;
    setState(e.target.value);
    onInputChange?.(!!city.trim() && !!e.target.value.trim());
  }

  function handleSubmit(e) {
    e.preventDefault();
    let finalCity = city.trim();
    let finalState = normalizeState(state.trim());

    // Handle city entered as "Washington DC" / "Washington D.C."
    const dcInCity = finalCity.match(/^Washington\s+(DC|D\.C\.)$/i);
    if (dcInCity) {
      finalCity = 'Washington';
      finalState = 'District of Columbia';
    }

    onSubmit({ city: finalCity, state: finalState });
  }

  return (
    <section className="setup-section">
      <h2>Commute Location</h2>
      <form id="commute-location-form" className="location-form" onSubmit={handleSubmit}>
        <div className="location-field">
          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={handleCity}
            maxLength={60}
            required
          />
        </div>
        <div className="location-field">
          <label htmlFor="state">State</label>
          <input
            id="state"
            type="text"
            value={state}
            onChange={handleState}
            maxLength={40}
            required
          />
        </div>
      </form>
    </section>
  );
}

export default LocationInput;
