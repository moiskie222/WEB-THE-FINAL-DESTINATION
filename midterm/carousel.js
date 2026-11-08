const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const images = [...carousel.querySelectorAll(".carousel-image")];
  const current = carousel.querySelector(".carousel-current");
  const total = carousel.querySelector(".carousel-total");
  const previousButton = carousel.querySelector(".carousel-prev");
  const nextButton = carousel.querySelector(".carousel-next");
  let activeIndex = 0;
  let autoplayTimer;

  if (images.length > 0) {
    if (total) total.textContent = String(images.length);

    const showImage = (index, animate = true) => {
      const nextIndex = (index + images.length) % images.length;
      if (nextIndex === activeIndex && animate) return;

      const outgoing = images[activeIndex];
      const incoming = images[nextIndex];
      activeIndex = nextIndex;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      incoming.classList.remove("hidden");

      if (animate && !reduceMotion && outgoing && incoming.animate) {
        outgoing.animate(
          [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.08)" }],
          { duration: 900, easing: "ease-in-out", fill: "forwards" }
        ).finished.then(() => outgoing.classList.add("hidden"));

        incoming.animate(
          [{ opacity: 0, transform: "scale(1.08)" }, { opacity: 1, transform: "scale(1)" }],
          { duration: 900, easing: "ease-in-out", fill: "both" }
        );
      } else {
        images.forEach((image, imageIndex) => {
          image.classList.toggle("hidden", imageIndex !== activeIndex);
        });
      }

      if (current) current.textContent = String(activeIndex + 1);
    };

    const stopAutoplay = () => window.clearInterval(autoplayTimer);
    const startAutoplay = () => {
      stopAutoplay();
      if (!document.hidden && images.length > 1) {
        autoplayTimer = window.setInterval(() => showImage(activeIndex + 1), 4000);
      }
    };

    const changeSlide = (index) => {
      showImage(index);
      startAutoplay();
    };

    previousButton?.addEventListener("click", () => changeSlide(activeIndex - 1));
    nextButton?.addEventListener("click", () => changeSlide(activeIndex + 1));
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    startAutoplay();
  }
}
