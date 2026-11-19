function updateStoreStatuses() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "numeric",
    hour12: false
  }).formatToParts(new Date());
  const currentTime = Number(parts.find((part) => part.type === "hour").value) * 60 +
    Number(parts.find((part) => part.type === "minute").value);

  document.querySelectorAll("[data-store-status]").forEach((badge) => {
    const openingTime = Number(badge.dataset.openHour) * 60;
    const closingTime = Number(badge.dataset.closeHour) * 60;
    const isOpen = currentTime >= openingTime && currentTime < closingTime;
    const label = badge.querySelector("[data-status-label]");
    const dot = badge.querySelector("[data-status-dot]");

    label.textContent = isOpen
      ? `Open now · closes ${badge.dataset.closeLabel}`
      : `Closed · opens ${badge.dataset.openLabel}`;
    badge.classList.toggle("bg-emerald-100", isOpen);
    badge.classList.toggle("text-emerald-800", isOpen);
    badge.classList.toggle("dark:bg-emerald-900/40", isOpen);
    badge.classList.toggle("dark:text-emerald-300", isOpen);
    badge.classList.toggle("bg-red-100", !isOpen);
    badge.classList.toggle("text-red-800", !isOpen);
    badge.classList.toggle("dark:bg-red-900/40", !isOpen);
    badge.classList.toggle("dark:text-red-300", !isOpen);
    dot.classList.toggle("bg-emerald-500", isOpen);
    dot.classList.toggle("bg-red-500", !isOpen);
  });
}

updateStoreStatuses();
setInterval(updateStoreStatuses, 60_000);
