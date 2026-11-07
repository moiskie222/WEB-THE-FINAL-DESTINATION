function PizzaCard({ name, description }) {
  return (
    <article className="rounded-3xl border border-orange-100 bg-orange-50 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-stone-950">
      <h3 className="text-xl font-bold">{name}</h3>
      <p className="mt-2 leading-relaxed text-stone-600 dark:text-stone-300">{description}</p>
    </article>
  );
}

export default PizzaCard;
