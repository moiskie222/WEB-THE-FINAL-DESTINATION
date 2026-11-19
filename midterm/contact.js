const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  const ratingInputs = [...contactForm.querySelectorAll("input[name='rating']")];
  const ratingStars = [...contactForm.querySelectorAll("input[name='rating'] + span img")];
  const updateRatingStars = () => {
    const selectedRating = Number(ratingInputs.find((input) => input.checked)?.value || 0);
    ratingStars.forEach((star, index) => {
      const active = index < selectedRating;
      star.classList.toggle("opacity-30", !active);
      star.classList.toggle("grayscale", !active);
      star.classList.toggle("opacity-100", active);
      star.classList.toggle("grayscale-0", active);
      star.classList.toggle("scale-110", active);
    });
  };

  ratingInputs.forEach((input) => input.addEventListener("change", updateRatingStars));
  contactForm.addEventListener("reset", () => requestAnimationFrame(updateRatingStars));

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = document.querySelector("#form-status");
    contactForm.querySelectorAll("[aria-invalid='true']").forEach((field) => {
      field.removeAttribute("aria-invalid");
      field.classList.remove("border-red-600");
    });
    const invalid = [...contactForm.querySelectorAll("[required]")].filter((field) => !field.validity.valid);

    if (invalid.length) {
      invalid.forEach((field) => {
        field.setAttribute("aria-invalid", "true");
        field.classList.add("border-red-600");
      });
      status.textContent = invalid.some((field) => field.validity.typeMismatch)
        ? "Please enter a valid email address and complete all required fields."
        : "Please complete all required fields.";
      status.className = "rounded-xl bg-red-100 p-4 text-red-800 dark:bg-red-950 dark:text-red-200";
      invalid[0].focus();
      return;
    }

    status.textContent = "Thanks for your feedback! Your response is ready.";
    status.className = "rounded-xl bg-green-100 p-4 text-green-800 dark:bg-green-950 dark:text-green-200";
    contactForm.reset();
  });
}
