(function () {
  const keys = {
    orders: "pizzahaus-customer-orders-v1",
    draft: "pizzahaus-order-draft-v1",
    favorites: "pizzahaus-favorites-v1",
    availability: "pizzahaus-menu-availability-v1",
    orderReset: "pizzahaus-pre-database-orders-cleared-v1"
  };

  function clearPreDatabaseOrdersOnce() {
    try {
      if (localStorage.getItem(keys.orderReset) === "done") return;
      localStorage.setItem(keys.orderReset, "pending");
      localStorage.removeItem(keys.orders);
      localStorage.removeItem(keys.draft);
      localStorage.setItem(keys.orderReset, "done");
    } catch (error) {
      console.error("Unable to clear pre-database customer orders.", error);
      throw new Error("Old customer orders could not be cleared in this browser. Check storage access and try again.");
    }
  }

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error(`Unable to read PizzaHaus data "${key}".`, error);
      throw new Error("Saved PizzaHaus data could not be read. Reload the page or clear this browser's saved demo data.");
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Unable to save PizzaHaus data "${key}".`, error);
      throw new Error("PizzaHaus data could not be saved in this browser. Check available storage and try again.");
    }
  }

  function getOrders() {
    clearPreDatabaseOrdersOnce();
    const orders = read(keys.orders, []);
    if (!Array.isArray(orders)) throw new Error("Saved PizzaHaus orders have an unexpected format.");
    return orders;
  }

  function getDraft() {
    clearPreDatabaseOrdersOnce();
    const draft = read(keys.draft, null);
    if (draft === null) return null;
    if (!draft || typeof draft !== "object" || !Array.isArray(draft.items)) {
      throw new Error("Your saved order draft has an unexpected format.");
    }
    return draft;
  }

  function saveDraft(draft) {
    clearPreDatabaseOrdersOnce();
    if (!draft || typeof draft !== "object" || !Array.isArray(draft.items)) {
      throw new Error("The order draft could not be saved because its format is invalid.");
    }
    write(keys.draft, draft);
  }

  function clearDraft() {
    clearPreDatabaseOrdersOnce();
    try {
      localStorage.removeItem(keys.draft);
    } catch (error) {
      console.error("Unable to clear the saved PizzaHaus order draft.", error);
      throw new Error("The order was saved, but its local draft could not be cleared.");
    }
  }

  function getFavorites() {
    const favorites = read(keys.favorites, []);
    if (!Array.isArray(favorites) || favorites.some((favorite) => typeof favorite !== "string")) {
      throw new Error("Saved PizzaHaus favorites have an unexpected format.");
    }
    return favorites;
  }

  function getAvailability() {
    const availability = read(keys.availability, {});
    if (!availability || typeof availability !== "object" || Array.isArray(availability)) {
      throw new Error("Saved menu availability has an unexpected format.");
    }
    return availability;
  }

  window.PizzaHausData = {
    getOrders,
    saveOrders: (orders) => {
      clearPreDatabaseOrdersOnce();
      write(keys.orders, orders);
    },
    getDraft,
    saveDraft,
    clearDraft,
    getFavorites,
    saveFavorites: (favorites) => write(keys.favorites, favorites),
    getAvailability,
    saveAvailability: (availability) => write(keys.availability, availability),
    orderStorageKey: keys.orders,
    availabilityStorageKey: keys.availability
  };
})();
