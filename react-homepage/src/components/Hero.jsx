import { useEffect, useState } from "react";
import CarouselButton from "./CarouselButton";
import leftArrow from "../assets/images/left-arrow-icon.png";
import rightArrow from "../assets/images/right-arrow-icon.png";

const AUTOPLAY_MS = 4000;

function Hero({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [tabHidden, setTabHidden] = useState(document.hidden);
  const paused = hovered || tabHidden;

  const showSlide = (index) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  useEffect(() => {
    const onVisibilityChange = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // Restarts whenever the slide changes, so a manual click resets the 4-second timer.
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, activeIndex, slides.length]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10">
      <div
        className="relative isolate flex min-h-96 items-center overflow-hidden rounded-3xl bg-stone-900 shadow-2xl"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {slides.map((slide, index) => (
          <img
            key={slide.alt}
            className={`absolute inset-0 -z-20 h-full w-full object-cover ${index === activeIndex ? "" : "hidden"}`}
            src={slide.src}
            alt={slide.alt}
          />
        ))}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/10"></div>

        <div className="max-w-3xl px-6 py-20 text-white sm:px-12 md:px-16">
          <p className="mb-5 inline-block rounded-full bg-amber-300 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-stone-900">
            Made fresh, made for sharing
          </p>
          <h1 className="text-5xl font-black leading-tight sm:text-6xl">
            A little more <span className="text-amber-300">pizza</span>, a lot more joy.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/90">
            Hand-stretched dough, rich tomato sauce, and fresh ingredients—straight from our oven to your table.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="rounded-full bg-red-800 px-6 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-stone-900"
              href="page1.html"
            >
              Explore the menu
            </a>
            <a
              className="rounded-full border border-white/70 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur transition hover:bg-white hover:text-stone-900"
              href="page3.html"
            >
              Get in touch
            </a>
          </div>
        </div>

        <CarouselButton
          label="Previous image"
          icon={leftArrow}
          iconAlt="Arrow left"
          position="right-20"
          onClick={() => showSlide(activeIndex - 1)}
        />
        <CarouselButton
          label="Next image"
          icon={rightArrow}
          iconAlt="Arrow right"
          position="right-6"
          onClick={() => showSlide(activeIndex + 1)}
        />
        <p
          className="absolute bottom-7 right-36 rounded-full bg-black/50 px-3 py-1 text-sm font-semibold text-white"
          aria-live="polite"
        >
          {activeIndex + 1} / {slides.length}
        </p>
      </div>
    </section>
  );
}

export default Hero;
