const menuSearch = document.querySelector("#menu-search");
const categoryButtons = [...document.querySelectorAll(".category-filter")];

if (menuSearch && categoryButtons.length) {
  const data = window.PizzaHausData;
  const buyModal = document.querySelector("#buy-modal");
  const orderModal = document.querySelector("#order-modal");
  const deliveryDetails = document.querySelector("#delivery-details");
  const fulfillmentOptions = [...document.querySelectorAll('input[name="fulfillment"]')];
  const locationField = document.querySelector("#delivery-location");
  const phoneField = document.querySelector("#customer-phone");
  const branchField = document.querySelector("#order-branch");
  const paymentField = document.querySelector("#payment-method");
  const customerNameField = document.querySelector("#customer-name");
  const deliveryNotesField = document.querySelector("#delivery-notes");
  const favoritesPanel = document.querySelector("#favorites-panel");
  let availability = data.getAvailability();
  const orders = new Map();
  let favorites = data.getFavorites();
  let selectedItem = null;
  let buyQuantity = 1;
  let selectedCategory = "all";

  const pesos = (value) => `P${Number(value).toFixed(2)}`;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const setModalVisibility = (modal, visible) => {
    if (!modal) return;
    modal.classList.toggle("hidden", !visible);
    modal.classList.toggle("flex", visible);
    modal.style.display = visible ? "flex" : "none";
  };
  const optionExtra = (select) => Number(select.selectedOptions[0].dataset.extra || 0);
  const manilaDateTime = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    const value = (type) => parts.find((part) => part.type === type).value;
    return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}`;
  };

  function showStatus(message, isError) {
    const status = document.querySelector("#menu-status");
    status.textContent = message;
    status.classList.toggle("text-red-700", Boolean(isError));
    status.classList.toggle("text-emerald-700", !isError);
  }

  function persistDraft(clearWhenEmpty) {
    const items = [...orders.values()];
    try {
      if (!items.length) {
        if (clearWhenEmpty) data.clearDraft();
        return;
      }
      data.saveDraft({
        items,
        customerName: customerNameField.value,
        phone: phoneField.value,
        fulfillment: document.querySelector('input[name="fulfillment"]:checked').value,
        location: locationField.value,
        notes: deliveryNotesField.value,
        branch: branchField.value,
        paymentMethod: paymentField.value,
        savedAt: new Date().toISOString()
      });
    } catch (error) {
      showStatus(error.message, true);
    }
  }

  function renderFavorites() {
    document.querySelector("#favorite-count").textContent = String(favorites.length);
    const favoriteItems = menuItems.filter(({ item }) => favorites.includes(item.dataset.itemName));
    favoritesPanel.innerHTML = favoriteItems.length
      ? `<div class="flex flex-wrap items-center justify-between gap-3"><strong>Your saved pizzas</strong><button id="clear-favorites" class="text-sm font-bold text-red-800" type="button">Clear all</button></div><div class="mt-3 flex flex-wrap gap-2">${favoriteItems.map(({ item }) => `<button class="favorite-shortcut rounded-full bg-orange-100 px-3 py-2 text-sm font-bold dark:bg-stone-800" type="button" data-item="${escapeHtml(item.dataset.itemName)}">${escapeHtml(item.dataset.itemName)}</button>`).join("")}</div>`
      : '<p class="text-sm text-stone-600 dark:text-stone-300">Tap the heart on a menu card to save a favorite.</p>';
    favoritesPanel.querySelector("#clear-favorites")?.addEventListener("click", () => {
      favorites = [];
      data.saveFavorites(favorites);
      renderFavorites();
      menuItems.forEach(({ item }) => updateFavoriteButton(item));
    });
    favoritesPanel.querySelectorAll(".favorite-shortcut").forEach((button) => {
      button.addEventListener("click", () => {
        menuSearch.value = button.dataset.item;
        selectedCategory = "all";
        categoryButtons[0].click();
        menuSearch.dispatchEvent(new Event("input"));
        document.querySelector("#menu-search").scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  function updateFavoriteButton(item) {
    const button = item.querySelector(".favorite-toggle");
    if (!button) return;
    const favorite = favorites.includes(item.dataset.itemName);
    button.textContent = favorite ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(favorite));
    button.setAttribute("aria-label", `${favorite ? "Remove" : "Save"} ${item.dataset.itemName} ${favorite ? "from" : "to"} favorites`);
  }

  function updateOrder(clearWhenEmpty) {
    const entries = [...orders.values()];
    const itemCount = entries.reduce((total, order) => total + order.quantity, 0);
    const total = entries.reduce((sum, order) => sum + order.unitPrice * order.quantity, 0);
    document.querySelector("#order-count").textContent = String(itemCount);
    document.querySelector("#order-total").textContent = pesos(total);
    document.querySelector("#cart-total").textContent = pesos(total);
    const list = document.querySelector("#order-list");
    document.querySelector("#place-order").disabled = !entries.length;
    if (entries.length) {
      list.classList.remove("hidden");
      document.querySelector("#order-total").parentElement.classList.remove("hidden");
      document.querySelector("#place-order").classList.remove("hidden");
      document.querySelector("#order-confirmation").classList.add("hidden");
      document.querySelector("#order-modal-title").textContent = "Your cart & order history";
      const isDelivery = document.querySelector('input[name="fulfillment"]:checked').value === "delivery";
      deliveryDetails.classList.toggle("hidden", !isDelivery);
      locationField.required = isDelivery;
    }
    list.innerHTML = entries.length ? entries.map((order, index) => `
      <div class="flex items-center justify-between gap-3 rounded-xl bg-orange-50 p-4 dark:bg-stone-950">
        <div><strong>${escapeHtml(order.name)}</strong>
          <p class="text-sm text-stone-600 dark:text-stone-300">${order.size}" · ${escapeHtml(order.crust)}${order.toppings.length ? ` · ${escapeHtml(order.toppings.join(", "))}` : ""}</p>
          <p class="text-sm text-stone-600 dark:text-stone-300">${order.quantity} × ${pesos(order.unitPrice)}</p>
        </div>
        <button class="remove-order rounded-lg border border-red-800 px-3 py-2 text-sm font-bold text-red-800" type="button" data-order-index="${index}" aria-label="Remove ${escapeHtml(order.name)}">Remove</button>
      </div>`).join("")
      : '<p class="rounded-xl bg-orange-50 p-4 text-center text-stone-600 dark:bg-stone-950 dark:text-stone-300">No items yet. Add a pizza to get started.</p>';
    persistDraft(clearWhenEmpty);
  }

  function renderOrderHistory() {
    const historyPanel = document.querySelector("#order-history");
    try {
      const history = data.getOrders().slice().reverse();
      historyPanel.innerHTML = history.length ? history.map((order) => `
        <article class="rounded-xl border border-orange-100 p-3 dark:border-stone-700">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <strong>${escapeHtml(order.Reference || "Order")}</strong>
            <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold dark:bg-stone-800">${escapeHtml(order.Status || "Received")}</span>
          </div>
          <p class="mt-2 text-sm">${escapeHtml((order.OrderItems || []).map((item) => `${item.Quantity} × ${item.ItemName}`).join(", "))}</p>
          <p class="mt-1 text-xs text-stone-500 dark:text-stone-400">${escapeHtml(order.OrderDateTime || "")} · ${escapeHtml(order.PaymentMethod || "Payment not selected")} · ${pesos(order.Total || 0)}</p>
          <p class="mt-1 text-xs text-stone-500 dark:text-stone-400">${escapeHtml(order.PaymentStatus || "Demo order")}</p>
        </article>`).join("")
        : '<p class="rounded-xl bg-orange-50 p-3 text-sm text-stone-600 dark:bg-stone-950 dark:text-stone-300">No submitted orders saved in this browser yet.</p>';
    } catch (error) {
      historyPanel.textContent = error.message;
      showStatus(error.message, true);
    }
  }

  function currentCustomizedPrice() {
    return selectedItem.price + optionExtra(document.querySelector("#custom-size")) +
      optionExtra(document.querySelector("#custom-crust")) +
      document.querySelectorAll('input[name="extra-topping"]:checked').length * 25;
  }

  function updateBuyQuantity() {
    const unitPrice = currentCustomizedPrice();
    document.querySelector("#buy-quantity").textContent = String(buyQuantity);
    document.querySelector("#buy-modal-price").textContent = `${pesos(unitPrice)} each`;
    document.querySelector("#buy-total").textContent = pesos(unitPrice * buyQuantity);
  }

  function addOrder(item, quantity, options) {
    const key = [item.name, options.size, options.crust, ...options.toppings].join("|");
    const existing = orders.get(key);
    orders.set(key, {
      ...item,
      ...options,
      unitPrice: item.price + options.sizeExtra + options.crustExtra + options.toppings.length * 25,
      quantity: (existing?.quantity || 0) + quantity
    });
    updateOrder();
  }

  function restoreDraft() {
    try {
      const draft = data.getDraft();
      if (!draft) return;
      if (draft.items.some((item) => !item || typeof item.name !== "string" ||
          !Array.isArray(item.toppings) || !Number.isFinite(Number(item.unitPrice)) ||
          !Number.isFinite(Number(item.quantity)) || Number(item.quantity) < 1)) {
        throw new Error("Your saved order draft contains invalid items and could not be restored.");
      }
      draft.items.forEach((item) => {
        const restoredItem = {
          ...item,
          unitPrice: Number(item.unitPrice),
          quantity: Number(item.quantity),
          toppings: item.toppings.map(String)
        };
        const key = [restoredItem.name, restoredItem.size, restoredItem.crust, ...restoredItem.toppings].join("|");
        orders.set(key, restoredItem);
      });
      customerNameField.value = draft.customerName || "";
      phoneField.value = draft.phone || "";
      locationField.value = draft.location || "";
      deliveryNotesField.value = draft.notes || "";
      if ([...branchField.options].some((option) => option.value === draft.branch)) {
        branchField.value = draft.branch;
      }
      if ([...paymentField.options].some((option) => option.value === draft.paymentMethod)) {
        paymentField.value = draft.paymentMethod;
      }
      const fulfillment = fulfillmentOptions.find((option) => option.value === draft.fulfillment);
      if (fulfillment) fulfillment.checked = true;
      fulfillmentOptions[0]?.dispatchEvent(new Event("change"));
      branchField.dispatchEvent(new Event("change"));
      updateOrder();
      showStatus("Your saved cart and checkout details were restored.", false);
    } catch (error) {
      showStatus(error.message, true);
    }
  }

  function openBuyModal(item) {
    selectedItem = item;
    buyQuantity = 1;
    document.querySelector("#buy-modal-title").textContent = item.name;
    document.querySelector("#custom-size").value = "10";
    document.querySelector("#custom-crust").value = "Classic";
    document.querySelectorAll('input[name="extra-topping"]').forEach((input) => { input.checked = false; });
    updateBuyQuantity();
    setModalVisibility(buyModal, true);
  }

  const menuSections = [...document.querySelectorAll("[data-menu-category]")];
  const menuItems = menuSections.flatMap((section) =>
    [...section.querySelectorAll("article")].map((item) => {
      const name = item.querySelector("h2")?.textContent.trim() || "";
      const priceText = item.querySelector("h2")?.parentElement.querySelector("span")?.textContent || "";
      const priceMatch = priceText.match(/\d+(?:\.\d+)?/);
      if (!name || !priceMatch) throw new Error("A menu item is missing its name or price.");
      const price = Number(priceMatch[0]);
      item.dataset.itemName = name;
      const menuItem = { name, price };
      const isAvailable = availability[name] !== false;
      const badge = document.createElement("span");
      const lowerName = name.toLocaleLowerCase();
      if (!isAvailable) {
        badge.className = "menu-badge sold-out";
        badge.textContent = "Sold out";
        item.classList.add("menu-sold-out");
      } else if (section.dataset.menuCategory === "Special Pizza Combo") {
        badge.className = "menu-badge promo";
        badge.textContent = "Shareable combo";
      } else if (/pepperoni|spicy|sisig/.test(lowerName)) {
        badge.className = "menu-badge spicy";
        badge.textContent = "Spicy";
      } else if (/tuna|corn|garden|mushroom|crab/.test(lowerName)) {
        badge.className = "menu-badge veggie";
        badge.textContent = /garden|mushroom|corn|tuna|crab/.test(lowerName) ? "Fresh" : "Vegetarian";
      } else {
        badge.className = "menu-badge";
        badge.textContent = "Best seller";
      }
      item.prepend(badge);
      const favoriteButton = document.createElement("button");
      favoriteButton.className = "favorite-toggle absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-2xl leading-none text-red-700 shadow-md backdrop-blur transition hover:scale-110 hover:bg-white dark:bg-stone-900/90 dark:text-orange-300 dark:hover:bg-stone-800";
      favoriteButton.type = "button";
      favoriteButton.addEventListener("click", () => {
        favorites = favorites.includes(name) ? favorites.filter((favorite) => favorite !== name) : [...favorites, name];
        data.saveFavorites(favorites);
        updateFavoriteButton(item);
        renderFavorites();
      });
      item.append(favoriteButton);
      const actions = document.createElement("div");
      actions.className = "mt-4 grid grid-cols-[1fr_auto] gap-2";
      actions.innerHTML = `
        <button class="add-order rounded-full bg-red-800 px-3 py-3 font-bold text-white hover:bg-red-900" type="button" ${isAvailable ? "" : "disabled"}>Buy</button>
        <button class="menu-buy-now rounded-full border border-red-800 px-3 py-3 font-bold text-red-800 hover:bg-orange-100 dark:border-orange-300 dark:text-orange-300" type="button" ${isAvailable ? "" : "disabled"}>Customize</button>`;
      actions.querySelector(".add-order").setAttribute("aria-label", `Buy ${name}`);
      actions.querySelector(".menu-buy-now").setAttribute("aria-label", `Customize ${name}`);
      actions.querySelector(".add-order").addEventListener("click", () => {
        addOrder(menuItem, 1, { size: 10, sizeExtra: 0, crust: "Classic", crustExtra: 0, toppings: [] });
        showStatus(`${name} was added to your order.`);
      });
      actions.querySelector(".menu-buy-now").addEventListener("click", () => openBuyModal(menuItem));
      item.querySelector(".p-5")?.append(actions);
      updateFavoriteButton(item);
      return { item, section, searchText: item.textContent.toLocaleLowerCase() };
    })
  );

  function applyAvailability() {
    availability = data.getAvailability();
    menuItems.forEach(({ item, section }) => {
      const name = item.dataset.itemName;
      const available = availability[name] !== false;
      const badge = item.querySelector(".menu-badge");
      item.classList.toggle("menu-sold-out", !available);
      if (!available) {
        badge.className = "menu-badge sold-out";
        badge.textContent = "Sold out";
      } else if (section.dataset.menuCategory === "Special Pizza Combo") {
        badge.className = "menu-badge promo";
        badge.textContent = "Shareable combo";
      } else if (/pepperoni|spicy|sisig/i.test(name)) {
        badge.className = "menu-badge spicy";
        badge.textContent = "Spicy";
      } else if (/tuna|corn|garden|mushroom|crab/i.test(name)) {
        badge.className = "menu-badge veggie";
        badge.textContent = /garden|mushroom|corn|tuna|crab/i.test(name) ? "Fresh" : "Vegetarian";
      } else {
        badge.className = "menu-badge";
        badge.textContent = "Best seller";
      }
      item.querySelectorAll(".add-order, .menu-buy-now").forEach((button) => {
        button.disabled = !available;
      });
    });
  }

  applyAvailability();

  const cravingKeywords = {
    cheesy: ["cheese", "cheesy", "mozzarella"],
    meaty: ["ham", "meat", "beef", "bacon", "sausage", "pepperoni", "pork", "sisig"],
    veggie: ["vegetable", "veggie", "mushroom", "corn", "basil"],
    spicy: ["spicy", "pepperoni", "hot"]
  };
  const searchParams = new URLSearchParams(window.location.search);
  let selectedCraving = searchParams.get("craving")?.toLowerCase() || "";
  menuSearch.value = searchParams.get("search") || "";
  if (!Object.prototype.hasOwnProperty.call(cravingKeywords, selectedCraving)) selectedCraving = "";
  const results = document.querySelector("#menu-results");

  function filterMenu() {
    const query = menuSearch.value.trim().toLocaleLowerCase();
    const keywords = cravingKeywords[selectedCraving] || [];
    let visibleCount = 0;
    menuItems.forEach(({ item, section, searchText }) => {
      const matchesCategory = selectedCategory === "all" || section.dataset.menuCategory === selectedCategory;
      const matchesCraving = !keywords.length || keywords.some((keyword) => searchText.includes(keyword));
      const visible = matchesCategory && matchesCraving && searchText.includes(query);
      item.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    });
    menuSections.forEach((section) => {
      section.classList.toggle("hidden", ![...section.querySelectorAll("article")].some((item) => !item.classList.contains("hidden")));
    });
    results.textContent = visibleCount
      ? `Showing ${visibleCount} menu item${visibleCount === 1 ? "" : "s"}${selectedCraving ? ` for ${selectedCraving} cravings` : ""}.`
      : "No menu items match your search.";
  }

  menuSearch.addEventListener("input", () => { selectedCraving = ""; filterMenu(); });
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      categoryButtons.forEach((categoryButton) => {
        const active = categoryButton === button;
        categoryButton.setAttribute("aria-pressed", String(active));
        categoryButton.classList.toggle("border-red-800", active);
        categoryButton.classList.toggle("bg-yellow-400", active);
        categoryButton.classList.toggle("text-red-900", active);
        categoryButton.classList.toggle("border-orange-100", !active);
        categoryButton.classList.toggle("bg-orange-50", !active);
        categoryButton.classList.toggle("text-stone-700", !active);
      });
      filterMenu();
    });
  });
  filterMenu();
  renderFavorites();

  branchField.addEventListener("change", () => {
    const city = branchField.value === "1" ? "Sipocot" : "Naga+City";
    document.querySelector("#branch-directions").href = `page4.html?branch=${encodeURIComponent(city.replace("+", " "))}`;
    persistDraft();
  });
  paymentField.addEventListener("change", persistDraft);
  document.querySelector("#show-favorites").addEventListener("click", () => favoritesPanel.classList.toggle("hidden"));
  document.querySelector("[data-show-combos]").addEventListener("click", () => {
    categoryButtons.find((button) => button.dataset.category === "Special Pizza Combo").click();
    document.querySelector('[data-menu-category="Special Pizza Combo"]').scrollIntoView({ behavior: "smooth" });
  });
  document.querySelector("#decrease-quantity").addEventListener("click", () => {
    buyQuantity = Math.max(1, buyQuantity - 1);
    updateBuyQuantity();
  });
  document.querySelector("#increase-quantity").addEventListener("click", () => {
    buyQuantity += 1;
    updateBuyQuantity();
  });
  document.querySelectorAll("#custom-size, #custom-crust, input[name='extra-topping']").forEach((control) => {
    control.addEventListener("change", updateBuyQuantity);
  });
  document.querySelector("#confirm-order").addEventListener("click", () => {
    const options = {
      size: Number(document.querySelector("#custom-size").value),
      sizeExtra: optionExtra(document.querySelector("#custom-size")),
      crust: document.querySelector("#custom-crust").value,
      crustExtra: optionExtra(document.querySelector("#custom-crust")),
      toppings: [...document.querySelectorAll('input[name="extra-topping"]:checked')].map((input) => input.value)
    };
    addOrder(selectedItem, buyQuantity, options);
    setModalVisibility(buyModal, false);
    showStatus(`${buyQuantity} × ${selectedItem.name} added to your order.`);
    setModalVisibility(orderModal, true);
  });
  document.querySelector("#close-buy-modal").addEventListener("click", () => setModalVisibility(buyModal, false));
  document.querySelector("#open-order").addEventListener("click", () => setModalVisibility(orderModal, true));
  document.querySelector("#close-order-modal").addEventListener("click", () => setModalVisibility(orderModal, false));
  fulfillmentOptions.forEach((option) => option.addEventListener("change", () => {
    const isDelivery = document.querySelector('input[name="fulfillment"]:checked').value === "delivery";
    deliveryDetails.classList.toggle("hidden", !isDelivery);
    locationField.required = isDelivery;
    persistDraft();
  }));
  fulfillmentOptions[0]?.dispatchEvent(new Event("change"));
  [customerNameField, phoneField, locationField, deliveryNotesField].forEach((field) => {
    field.addEventListener("input", persistDraft);
  });
  restoreDraft();
  renderOrderHistory();

  document.querySelector("#order-list").addEventListener("click", (event) => {
    const button = event.target.closest(".remove-order");
    if (!button) return;
    const order = [...orders.values()][Number(button.dataset.orderIndex)];
    if (order) orders.delete([order.name, order.size, order.crust, ...order.toppings].join("|"));
    updateOrder(true);
  });

  document.querySelector("#place-order").addEventListener("click", () => {
    const fulfillment = document.querySelector('input[name="fulfillment"]:checked').value;
    const deliveryStatus = document.querySelector("#delivery-status");
    const customerName = document.querySelector("#customer-name").value.trim();
    const phone = phoneField.value.trim();
    const location = locationField.value.trim();
    const deliveryNotes = document.querySelector("#delivery-notes").value.trim();
    const paymentMethod = paymentField.value;
    if (!customerName || !phone || (fulfillment === "delivery" && !location)) {
      deliveryStatus.textContent = "Enter your name and contact number; delivery orders also need a delivery location.";
      deliveryStatus.classList.remove("hidden");
      (!customerName ? document.querySelector("#customer-name") : !phone ? phoneField : locationField).focus();
      return;
    }

    const entries = [...orders.values()];
    if (!entries.length) return;
    const orderID = Date.now();
    const reference = `PH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const order = {
      OrderID: orderID,
      Reference: reference,
      StoreID: Number(branchField.value),
      StoreName: branchField.selectedOptions[0].dataset.store,
      CustomerName: customerName,
      ContactNumber: phone,
      PickupMethod: fulfillment === "pickup" ? "Pickup" : "Delivery",
      DeliveryLocation: fulfillment === "delivery" ? location : "",
      Notes: deliveryNotes,
      PaymentMethod: paymentMethod,
      PaymentStatus: paymentMethod === "Cash" ? "Pay on pickup/delivery" : "Demo only - not processed",
      OrderDateTime: manilaDateTime(),
      OrderItems: entries.map((entry) => ({
        ItemName: entry.name, Quantity: entry.quantity, Price: entry.unitPrice,
        Size: entry.size, Crust: entry.crust, Toppings: entry.toppings
      })),
      Total: entries.reduce((sum, entry) => sum + entry.unitPrice * entry.quantity, 0),
      Status: "Received"
    };
    try {
      const savedOrders = data.getOrders();
      data.saveOrders([...savedOrders, order]);
    } catch (error) {
      deliveryStatus.textContent = error.message;
      deliveryStatus.classList.remove("hidden");
      return;
    }
    orders.clear();
    updateOrder(true);
    deliveryStatus.classList.add("hidden");
    document.querySelector("#place-order").classList.add("hidden");
    document.querySelector("#order-confirmation").classList.remove("hidden");
    document.querySelector("#order-confirmation").innerHTML = `
      <p class="font-bold text-emerald-800 dark:text-emerald-300">Order received</p>
      <p class="mt-2">Your reference number is <strong>${escapeHtml(reference)}</strong>.</p>
      <p class="mt-1 text-sm">Your order is saved in the history below. ${escapeHtml(order.StoreName)} · ${escapeHtml(order.PickupMethod)} · ${escapeHtml(paymentMethod)}</p>
      <p class="mt-1 text-sm">${escapeHtml(order.PaymentStatus)}</p>
      `;
    document.querySelector("#order-modal-title").textContent = "Order confirmed";
    document.querySelector("#order-list").classList.add("hidden");
    document.querySelector("#order-total").parentElement.classList.add("hidden");
    document.querySelector("#delivery-details").classList.add("hidden");
    renderOrderHistory();
  });
  [buyModal, orderModal].forEach((modal) => modal.addEventListener("click", (event) => {
    if (event.target === modal) setModalVisibility(modal, false);
  }));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setModalVisibility(buyModal, false);
      setModalVisibility(orderModal, false);
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === data.orderStorageKey) {
      showStatus("Order status updated by staff.");
      renderOrderHistory();
    }
    if (event.key === data.availabilityStorageKey) applyAvailability();
  });
}
