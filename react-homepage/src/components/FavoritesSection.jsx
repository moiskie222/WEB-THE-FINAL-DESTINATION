import PizzaCard from "./PizzaCard";

function FavoritesSection({ items }) {
  return (
    <section className="border-y border-orange-100 bg-white py-14 dark:border-stone-800 dark:bg-stone-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-bold uppercase tracking-widest text-red-800 dark:text-orange-300">Our favorites</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Good things, baked daily.</h2>
          </div>
          <a className="font-bold text-red-800 hover:underline dark:text-orange-300" href="page1.html">
            See the full menu →
          </a>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <PizzaCard key={item.name} name={item.name} description={item.description} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FavoritesSection;
