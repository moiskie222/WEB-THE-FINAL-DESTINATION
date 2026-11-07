function CarouselButton({ label, icon, iconAlt, position, onClick }) {
  return (
    <button
      className={`absolute bottom-5 ${position} z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-xl font-bold text-stone-900 shadow transition hover:bg-amber-300`}
      type="button"
      aria-label={label}
      onClick={onClick}
    >
      <img className="h-5 w-5 object-contain" src={icon} alt={iconAlt} aria-hidden="true" />
    </button>
  );
}

export default CarouselButton;
