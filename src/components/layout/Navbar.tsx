import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/projects", label: "Projects" },
  { to: "/lab", label: "Lab" },
  { to: "/about", label: "About" },
  { to: "/resume", label: "Resume" },
];

// Small orbital mark: a ring with one warm node. Decorative only.
function Mark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="6" fill="var(--brand-teal)" />
      <ellipse cx="16" cy="16" rx="14" ry="6" fill="none" stroke="var(--brand-mint)" strokeWidth="1.2" transform="rotate(-24 16 16)" />
      <circle cx="27.5" cy="10.5" r="2.2" fill="var(--brand-amber)" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes the menu and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="wordmark" aria-label="Johnson Pedia, home">
          <Mark />
          <span>Johnson Pedia</span>
        </Link>

        <button
          ref={toggleRef}
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          <span className="visually-hidden">{open ? "Close menu" : "Open menu"}</span>
        </button>

        <nav id="primary-nav" className={`site-nav${open ? " is-open" : ""}`} aria-label="Primary">
          <ul>
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to}>{l.label}</NavLink>
              </li>
            ))}
            <li>
              <NavLink to="/contact" className="btn btn--primary">
                Get in touch
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
