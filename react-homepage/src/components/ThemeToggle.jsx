import sunIcon from "../assets/images/sun-icon.webp";
import moonIcon from "../assets/images/moon-icon.png";

function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      className="rounded-full border border-stone-300 px-3 py-2 text-sm font-semibold hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-red-600 dark:border-stone-700 dark:hover:bg-stone-800"
      type="button"
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      aria-pressed={dark}
      onClick={onToggle}
    >
      <img
        className="inline-block h-5 w-5 align-middle object-contain"
        src={dark ? moonIcon : sunIcon}
        alt={dark ? "Moon icon" : "Sun icon"}
        aria-hidden="true"
      />
      <span className="hidden sm:inline"> Theme</span>
    </button>
  );
}

export default ThemeToggle;
