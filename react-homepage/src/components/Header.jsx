import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/images/pizza-logo.webp";
import hamIcon from "../assets/images/ham-icon.png";

function Header({ navLinks }) {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (error) {
      console.error("Unable to save the color theme.", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <a
          className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-red-800 dark:text-orange-300"
          href="index.html"
        >
          <img
            className="h-12 w-12 rounded-full object-contain"
            src={logo}
            alt="PizzaHaus logo"
            aria-hidden="true"
          />
          PizzaHaus
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              className={
                link.current
                  ? "border-b-2 border-red-800 py-2 font-semibold text-red-800 dark:border-orange-300 dark:text-orange-300"
                  : "border-b-2 border-transparent py-2 hover:border-red-800 hover:text-red-800 dark:hover:border-orange-300 dark:hover:text-orange-300"
              }
              href={link.href}
              aria-current={link.current ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle dark={dark} onToggle={toggleTheme} />
          <button
            className="rounded-lg border border-stone-300 px-3 py-2 md:hidden dark:border-stone-700"
            type="button"
            aria-label={`${menuOpen ? "Close" : "Open"} navigation`}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <img className="h-6 w-6 object-contain" src={hamIcon} alt="Ham icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        className={`${menuOpen ? "" : "hidden"} border-t border-orange-100 px-4 py-3 dark:border-stone-800 md:hidden`}
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              className="rounded-lg px-3 py-2 hover:bg-orange-100 dark:hover:bg-stone-800"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default Header;
