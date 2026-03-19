import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/qr", label: "QR Public" },
  { to: "/gate-qr", label: "Gate QR" },
  { to: "/login", label: "Login" }
];

export default function Navbar() {
  return (
    <header className="app-navbar">
      <div className="app-navbar-inner">
        <NavLink to="/" className="app-brand">
          Smart Hostel Management
        </NavLink>

        <nav className="app-nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `app-nav-link${isActive ? " active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
