import { NavLink } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  return (
    <nav className="main-nav">
      <NavLink to="/" className="nav-logo">Commute Forecast</NavLink>
      <ul className="nav-links">
        <li><NavLink to="/">Home</NavLink></li>
      </ul>
    </nav>
  );
}

export default NavBar;
