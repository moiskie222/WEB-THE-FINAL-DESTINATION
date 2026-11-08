const menuSearch = document.querySelector("#menu-search");
const categoryButtons = [...document.querySelectorAll(".category-filter")];

if (menuSearch && categoryButtons.length) {
  const buyModal = document.querySelector("#buy-modal");
  const orderModal = document.querySelector("#order-modal");
  const orders = new Map();
  let selectedItem = null;
  let buyQuantity = 1;

  const pesos = (value) => `P${value.toFixed(2)}`;
  const setModalVisibility = (modal, visible) => {
    modal?.classList.toggle("hidden", !visible);
    modal?.classList.toggle("flex", visible);
    if (modal) modal.style.display = visible ? "flex" : "none";
  };

  const updateOrder = () => {
    const entries = [...orders.values()];
    const itemCount = entries.reduce((total, order) => total + order.quantity, 0);
    const total = entries.reduce((sum, order) => sum + order.price * order.quantity, 0);
    document.querySelector("#order-count").textContent = String(itemCount);
    document.querySelector("#order-total").textContent = pesos(total);
    document.querySelector("#cart-total").textContent = pesos(total);
    const list = document.querySelector("#order-list");

    if (!entries.length) {
      list.innerHTML = '<p class="rounded-xl bg-orange-50 p-4 text-center text-stone-600 dark:bg-stone-950 dark:text-stone-300">No orders yet.</p>';
      document.querySelector("#place-order").disabled = true;
      return;
    }

    document.querySelector("#place-order").disabled = false;
    list.innerHTML = entries.map((order, index) => `
      <div class="flex items-center justify-between gap-3 rounded-xl bg-orange-50 p-4 dark:bg-stone-950">
        <div>
          <strong>${order.name}</strong>
          <p class="text-sm text-stone-600 dark:text-stone-300">${order.quantity} × ${pesos(order.price)}</p>
        </div>
        <button class="remove-order rounded-lg border border-red-800 px-3 py-2 text-sm font-bold text-red-800" type="button" data-order-index="${index}" aria-label="Remove ${order.name}">Remove</button>
      </div>
    `).join("");
  };

  const addOrder = (item, quantity = 1) => {
    const existing = orders.get(item.name);
    orders.set(item.name, {
      ...item,
      quantity: (existing?.quantity || 0) + quantity,
    });
    updateOrder();
  };


  const openBuyModal = (item) => {
    selectedItem = item;
    buyQuantity = 1;
    document.querySelector("#buy-modal-title").textContent = item.name;
    document.querySelector("#buy-modal-price").textContent = `${pesos(item.price)} each`;
    document.querySelector("#buy-quantity").textContent = "1";
    document.querySelector("#buy-total").textContent = pesos(item.price);
    setModalVisibility(buyModal, true);
  };

  const updateBuyQuantity = () => {
    document.querySelector("#buy-quantity").textContent = String(buyQuantity);
    document.querySelector("#buy-total").textContent = pesos(selectedItem.price * buyQuantity);
  };

  const menuSections = [...document.querySelectorAll("[data-menu-category]")];
  const menuItems = menuSections.flatMap((section) =>
    [...section.querySelectorAll("article")].map((item) => {
      const name = item.querySelector("h2")?.textContent.trim() || "";
      const searchText = item.textContent.toLocaleLowerCase();
      const priceText = item.querySelector("h2")?.parentElement.querySelector("span")?.textContent || "";
      const priceMatch = priceText.match(/\d+(?:\.\d+)?/);
      if (!name || !priceMatch) {
        throw new Error("A menu item is missing its name or price.");
      }
      const price = Number(priceMatch[0]);
      const menuItem = { name, price };
      const actions = document.createElement("div");
      actions.className = "mt-4 grid grid-cols-2 gap-3";
      actions.innerHTML = `
        <button class="add-order rounded-full border border-red-800 px-3 py-3 font-bold text-red-800 hover:bg-orange-100 dark:border-orange-300 dark:text-orange-300" type="button">Add</button>
        <button class="menu-buy-now rounded-full bg-red-800 px-3 py-3 font-bold text-white hover:bg-red-900 dark:bg-orange-700" type="button">Buy</button>
      `;
      actions.querySelector(".add-order").setAttribute("aria-label", `Add ${name} to orders`);
      actions.querySelector(".menu-buy-now").setAttribute("aria-label", `Buy ${name}`);
      actions.querySelector(".add-order").addEventListener("click", () => {
        addOrder(menuItem);
        document.querySelector("#menu-status").textContent = `${name} was added to your orders.`;
      });
      actions.querySelector(".menu-buy-now").addEventListener("click", () => openBuyModal(menuItem));
      item.querySelector(".p-5")?.append(actions);
      return {
        item,
        section,
        searchText,
      };
    })
  );
  const results = document.querySelector("#menu-results");
  let selectedCategory = "all";

  const filterMenu = () => {
    const query = menuSearch.value.trim().toLocaleLowerCase();
    let visibleCount = 0;

    menuItems.forEach(({ item, section, searchText }) => {
      const matchesCategory = selectedCategory === "all" || section.dataset.menuCategory === selectedCategory;
      const matchesSearch = searchText.includes(query);
      const visible = matchesCategory && matchesSearch;
      item.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    });

    menuSections.forEach((section) => {
      const hasVisibleItems = [...section.querySelectorAll("article")].some((item) => !item.classList.contains("hidden"));
      section.classList.toggle("hidden", !hasVisibleItems);
    });

    results.textContent = visibleCount
      ? `Showing ${visibleCount} menu item${visibleCount === 1 ? "" : "s"}.`
      : "No menu items match your search.";
  };

  menuSearch.addEventListener("input", filterMenu);
  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      categoryButtons.forEach((categoryButton) => {
        const active = categoryButton === button;
        categoryButton.setAttribute("aria-pressed", String(active));
        categoryButton.classList.toggle("border-red-800", active);
        categoryButton.classList.toggle("bg-red-800", active);
        categoryButton.classList.toggle("text-white", active);
        categoryButton.classList.toggle("border-orange-100", !active);
        categoryButton.classList.toggle("bg-orange-50", !active);
        categoryButton.classList.toggle("text-stone-700", !active);
        categoryButton.classList.toggle("dark:border-orange-400", active);
        categoryButton.classList.toggle("dark:bg-orange-700", active);
        categoryButton.classList.toggle("dark:text-white", active);
        categoryButton.classList.toggle("dark:border-stone-700", !active);
        categoryButton.classList.toggle("dark:bg-stone-950", !active);
        categoryButton.classList.toggle("dark:text-stone-200", !active);
        if (categoryButton.dataset.category === "all") {
          categoryButton.classList.toggle("bg-yellow-400", active);
          categoryButton.classList.toggle("text-red-900", active);
          categoryButton.classList.toggle("dark:text-red-900", active);
          categoryButton.classList.toggle("border-yellow-400", active);
        }
      });
      filterMenu();
    });
  });
  filterMenu();

  document.querySelector("#decrease-quantity")?.addEventListener("click", () => {
    buyQuantity = Math.max(1, buyQuantity - 1);
    updateBuyQuantity();
  });
  document.querySelector("#increase-quantity")?.addEventListener("click", () => {
    buyQuantity += 1;
    updateBuyQuantity();
  });
  document.querySelector("#confirm-order")?.addEventListener("click", () => {
    addOrder(selectedItem, buyQuantity);
    setModalVisibility(buyModal, false);
    document.querySelector("#menu-status").textContent = `${buyQuantity} × ${selectedItem.name} was added to your orders.`;
    setModalVisibility(orderModal, true);
  });
  document.querySelector("#close-buy-modal")?.addEventListener("click", () => setModalVisibility(buyModal, false));
  document.querySelector("#open-order")?.addEventListener("click", () => setModalVisibility(orderModal, true));
  document.querySelector("#close-order-modal")?.addEventListener("click", () => setModalVisibility(orderModal, false));
  document.querySelector("#order-list")?.addEventListener("click", (event) => {
    const button = event.target.closest(".remove-order");
    if (!button) return;
    const order = [...orders.values()][Number(button.dataset.orderIndex)];
    orders.delete(order.name);
    updateOrder();
  });
  document.querySelector("#place-order")?.addEventListener("click", () => {
    const locationField = document.querySelector("#delivery-location");
    const phoneField = document.querySelector("#delivery-phone");
    const deliveryStatus = document.querySelector("#delivery-status");
    const location = locationField.value.trim();
    const phone = phoneField.value.trim();

    if (!location || !phone) {
      deliveryStatus.textContent = "Please enter your delivery location and contact number.";
      deliveryStatus.classList.remove("hidden");
      (!location ? locationField : phoneField).focus();
      return;
    }

    deliveryStatus.classList.add("hidden");
    const notes = document.querySelector("#delivery-notes").value.trim();
    document.querySelector("#menu-status").textContent = `Order placed for delivery to ${location}.${notes ? ` Notes: ${notes}` : ""}`;
    orders.clear();
    updateOrder();
    setModalVisibility(orderModal, false);
    locationField.value = "";
    phoneField.value = "";
  });
  [buyModal, orderModal].forEach((modal) => modal?.addEventListener("click", (event) => {
    if (event.target === modal) setModalVisibility(modal, false);
  }));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setModalVisibility(buyModal, false);
      setModalVisibility(orderModal, false);
    }
  });
  updateOrder();
}
