import { useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import './App.css';

function App() {
  const saveRef = useRef(null);
  const loadRef = useRef(null);
  const [saveEnabled, setSaveEnabled] = useState(false);

  return (
    <Router>
      <div className="App" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/resources/bg-img.png)` }}>
        <NavBar
          onSave={() => saveRef.current?.()}
          onLoad={() => loadRef.current?.()}
          saveEnabled={saveEnabled}
        />
        <Routes>
          <Route path="/" element={
            <Home
              onRegisterSave={fn => { saveRef.current = fn; }}
              onRegisterLoad={fn => { loadRef.current = fn; }}
              onSaveEnabledChange={setSaveEnabled}
            />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
