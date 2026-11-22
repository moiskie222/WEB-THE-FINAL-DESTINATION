(function () {
  const keys = {
    orders: "pizzahaus-customer-orders-v1",
    draft: "pizzahaus-order-draft-v1",
    favorites: "pizzahaus-favorites-v1",
    availability: "pizzahaus-menu-availability-v1",
    orderReset: "pizzahaus-pre-database-orders-cleared-v1"
  };

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

  function apiRequest(action, method, body) {
    const request = new XMLHttpRequest();
    const url = `http://127.0.0.1:8080/api.php?action=${encodeURIComponent(action)}`;
    request.open(method, url, false);
    request.setRequestHeader("Accept", "application/json");
    if (body) request.setRequestHeader("Content-Type", "application/json");
    try {
      request.send(body ? JSON.stringify(body) : null);
    } catch (error) {
      throw new Error("The database server could not be reached. Start PHP and MariaDB, then reload.");
    }
    let payload;
    try {
      payload = JSON.parse(request.responseText);
    } catch (error) {
      throw new Error("The database server returned an invalid response.");
    }
    if (request.status < 200 || request.status >= 300) {
      throw new Error(payload.error || "The database request failed.");
    }
    return payload;
  }

  function getOrders() {
    const payload = apiRequest("orders", "GET");
    if (!Array.isArray(payload.orders)) throw new Error("Database orders have an unexpected format.");
    write(keys.orders, payload.orders);
    return payload.orders;
  }

  function getDraft() {
    const draft = read(keys.draft, null);
    if (draft === null) return null;
    if (!draft || typeof draft !== "object" || !Array.isArray(draft.items)) {
      throw new Error("Your saved order draft has an unexpected format.");
    }
    return draft;
  }

  function saveDraft(draft) {
    if (!draft || typeof draft !== "object" || !Array.isArray(draft.items)) {
      throw new Error("The order draft could not be saved because its format is invalid.");
    }
    write(keys.draft, draft);
  }

  function clearDraft() {
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
      if (!Array.isArray(orders)) throw new Error("Orders have an unexpected format.");
      const payload = apiRequest("save_orders", "POST", { orders });
      if (!Array.isArray(payload.orders)) throw new Error("The database did not return saved orders.");
      write(keys.orders, payload.orders);
      return payload.orders;
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
