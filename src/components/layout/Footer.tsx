import { Link } from "react-router-dom";
import { GITHUB_URL } from "../../lib/links";

const links = [
  { to: "/projects", label: "Projects" },
  { to: "/lab", label: "Lab" },
  { to: "/about", label: "About" },
  { to: "/resume", label: "Resume" },
  { to: "/contact", label: "Contact" },
];

// Contact email and social links are added once confirmed (blueprint: only confirmed details).
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__name">Johnson Pedia</p>
        <nav aria-label="Footer">
          <ul>
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
            </li>
          </ul>
        </nav>
        <p className="site-footer__copy">© {new Date().getFullYear()} Babarinde Johnson Omotayo</p>
      </div>
    </footer>
  );
}
