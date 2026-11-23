const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  const ratingInputs = [...contactForm.querySelectorAll("input[name='rating']")];
  const ratingStars = [...contactForm.querySelectorAll("input[name='rating'] + span img")];
  const ratingLabel = contactForm.querySelector("#rating-label");
  const topicInputs = [...contactForm.querySelectorAll("input[name='topic']")];
  const orderNumberField = contactForm.querySelector("#order-number-field");
  const orderNumberInput = contactForm.querySelector("#order-number");
  const topicOptions = contactForm.querySelector("[data-topic-options]");
  const ratingLabels = ["Poor", "Okay", "Good", "Great", "Excellent"];
  let previewRating = 0;

  const updateRatingStars = () => {
    const selectedRating = Number(ratingInputs.find((input) => input.checked)?.value || 0);
    const activeRating = previewRating || selectedRating;
    ratingStars.forEach((star, index) => {
      const active = index < activeRating;
      star.classList.toggle("opacity-30", !active);
      star.classList.toggle("grayscale", !active);
      star.classList.toggle("opacity-100", active);
      star.classList.toggle("grayscale-0", active);
      star.classList.toggle("scale-110", active);
    });
    ratingLabel.textContent = activeRating
      ? ratingLabels[activeRating - 1]
      : "Select a rating";
  };

  const updateOrderNumberVisibility = () => {
    const isOrderIssue = topicInputs.find((input) => input.checked)?.value === "Order issue";
    orderNumberField.classList.toggle("hidden", !isOrderIssue);
    if (!isOrderIssue) orderNumberInput.value = "";
  };

  ratingInputs.forEach((input) => {
    input.addEventListener("change", updateRatingStars);
    input.addEventListener("focus", () => {
      previewRating = Number(input.value);
      updateRatingStars();
    });
    input.addEventListener("blur", () => {
      previewRating = 0;
      updateRatingStars();
    });
    input.parentElement.addEventListener("mouseenter", () => {
      previewRating = Number(input.value);
      updateRatingStars();
    });
    input.parentElement.addEventListener("mouseleave", () => {
      previewRating = 0;
      updateRatingStars();
    });
  });
  topicInputs.forEach((input) => input.addEventListener("change", updateOrderNumberVisibility));
  contactForm.addEventListener("reset", () => requestAnimationFrame(() => {
    previewRating = 0;
    updateRatingStars();
    updateOrderNumberVisibility();
  }));
  updateRatingStars();
  updateOrderNumberVisibility();

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = document.querySelector("#form-status");
    contactForm.querySelectorAll("[aria-invalid='true']").forEach((field) => {
      field.removeAttribute("aria-invalid");
      field.classList.remove("border-red-600");
    });
    topicOptions.classList.remove("rounded-2xl", "p-1", "ring-2", "ring-red-600");
    const invalid = [...contactForm.querySelectorAll("[required]")].filter((field) => !field.validity.valid);

    if (invalid.length) {
      invalid.forEach((field) => {
        field.setAttribute("aria-invalid", "true");
        field.classList.add("border-red-600");
      });
      if (invalid.some((field) => field.name === "topic")) {
        topicOptions.classList.add("rounded-2xl", "p-1", "ring-2", "ring-red-600");
      }
      status.textContent = invalid.some((field) => field.validity.typeMismatch)
        ? "Please enter a valid email address and complete all required fields."
        : "Please complete all required fields.";
      status.className = "rounded-xl bg-red-100 p-4 text-red-800 dark:bg-red-950 dark:text-red-200";
      invalid[0].focus();
      return;
    }

    status.textContent = "Thanks for your feedback. This demo form does not send or store responses yet.";
    status.className = "rounded-xl bg-green-100 p-4 text-green-800 dark:bg-green-950 dark:text-green-200";
    contactForm.reset();
  });
}