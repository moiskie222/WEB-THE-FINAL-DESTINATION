const mobileButton = document.querySelector("#mobile-toggle");
const mobileNav = document.querySelector("#mobile-nav");

if (mobileButton && mobileNav) {
  mobileButton.addEventListener("click", () => {
    const open = mobileButton.getAttribute("aria-expanded") !== "true";
    mobileButton.setAttribute("aria-expanded", String(open));
    mobileButton.setAttribute("aria-label", `${open ? "Close" : "Open"} navigation`);
    mobileNav.classList.toggle("hidden", !open);
  });
}
