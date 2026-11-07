import Header from "./components/Header";
import Hero from "./components/Hero";
import FavoritesSection from "./components/FavoritesSection";
import Footer from "./components/Footer";
import { navLinks, slides, favorites } from "./data/siteData";

function App() {
  return (
    <>
      <Header navLinks={navLinks} />
      <main>
        <Hero slides={slides} />
        <FavoritesSection items={favorites} />
      </main>
      <Footer />
    </>
  );
}

export default App;
