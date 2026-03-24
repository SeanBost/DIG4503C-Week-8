import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

function NavBar({ onSave, onLoad, saveEnabled }) {
  const [saveLabel, setSaveLabel] = useState('Save Commute');
  const [loadLabel, setLoadLabel] = useState('Load Commute');

  function handleSave() {
    const ok = onSave?.();
    if (ok) {
      setSaveLabel('Commute Saved!');
      setTimeout(() => setSaveLabel('Save Commute'), 2000);
    }
  }

  function handleLoad() {
    const ok = onLoad?.();
    if (ok) {
      setLoadLabel('Commute Loaded!');
      setTimeout(() => setLoadLabel('Load Commute'), 2000);
    }
  }

  return (
    <nav className="main-nav">
      <NavLink to="/" className="nav-logo">
        <img className="nav-logo-icon" src="/resources/car-img.png" alt="" />
        <span className="nav-logo-text">Commute Forecast</span>
      </NavLink>
      <div className="nav-actions">
        <button className="nav-btn" onClick={handleSave} disabled={!saveEnabled}>{saveLabel}</button>
        <button className="nav-btn" onClick={handleLoad}>{loadLabel}</button>
      </div>
    </nav>
  );
}

export default NavBar;
