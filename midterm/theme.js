const themeButton = document.querySelector("#theme-toggle");

if (themeButton) {
  const themeIcon = themeButton.querySelector("img");
  const updateThemeButton = (dark) => {
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
    themeIcon.src = dark ? "images/moon-icon.png" : "images/sun-icon.webp";
    themeIcon.alt = dark ? "Moon icon" : "Sun icon";
  };

  themeButton.addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark");
    updateThemeButton(dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch (error) {
      console.error("Unable to save the color theme.", error);
    }
  });
  const dark = document.documentElement.classList.contains("dark");
  updateThemeButton(dark);
}
