const schema = {
  CustomerOrder: {
    label: "Orders", icon: "▣", id: "OrderID",
    fields: [
      ["OrderID", "number", "Order ID"], ["Reference", "text", "Reference"],
      ["CustomerName", "text", "Customer name"], ["ContactNumber", "tel", "Contact number"],
      ["StoreID", "number", "Store ID"], ["StoreName", "text", "Branch"],
      ["PickupMethod", "text", "Fulfillment"], ["DeliveryLocation", "text", "Delivery location"],
      ["Notes", "textarea", "Customer notes"], ["PaymentMethod", "text", "Payment method"],
      ["PaymentStatus", "text", "Payment status"], ["OrderDateTime", "text", "Order date & time"],
      ["Total", "number", "Total", { step: "0.01" }], ["Status", "text", "Status"]
    ]
  },
  OrderDetails: {
    label: "Order details", icon: "☷", id: "OrderDetailID", readOnly: true,
    fields: [
      ["OrderDetailID", "text", "Order detail ID"], ["OrderID", "number", "Order ID"],
      ["MenuItemID", "number", "Menu item ID"], ["Quantity", "number", "Quantity"],
      ["Price", "number", "Price", { step: "0.01" }]
    ]
  },
  MenuItem: {
    label: "Menu items", icon: "◉", id: "MenuItemID",
    fields: [
      ["MenuItemID", "number", "Menu item ID"], ["ItemName", "text", "Item name"],
      ["Price", "number", "Price", { step: "0.01" }]
    ]
  },
  Store: {
    label: "Stores", icon: "⌂", id: "StoreID",
    fields: [
      ["StoreID", "number", "Store ID"], ["StoreName", "text", "Store name"],
      ["Location", "text", "Location"], ["OperatingHours", "text", "Operating hours"],
      ["ManagerName", "text", "Manager name"]
    ]
  },
  Ingredient: {
    label: "Ingredients", icon: "◌", id: "IngredientID",
    fields: [
      ["IngredientID", "number", "Ingredient ID"], ["IngredientName", "text", "Ingredient name"],
      ["UnitMeasure", "text", "Unit of measure"], ["CurrentStock", "number", "Current stock", { step: "0.01" }],
      ["ReorderLevel", "number", "Reorder level", { step: "0.01" }]
    ]
  },
  Supplier: {
    label: "Suppliers", icon: "♧", id: "SupplierID",
    fields: [
      ["SupplierID", "number", "Supplier ID"], ["SupplierName", "text", "Supplier name"],
      ["ContactInfo", "text", "Contact info"], ["Address", "text", "Address"]
    ]
  },
  Delivery: {
    label: "Deliveries", icon: "⇢", id: "DeliveryID",
    fields: [
      ["DeliveryID", "number", "Delivery ID"], ["SupplierID", "number", "Supplier ID"],
      ["StoreID", "number", "Store ID"], ["DeliveryDate", "date", "Delivery date"],
      ["TotalQuantity", "number", "Total quantity", { step: "0.01" }]
    ]
  },
  InventoryTransaction: {
    label: "Transactions", icon: "↕", id: "TransactionID",
    fields: [
      ["TransactionID", "number", "Transaction ID"], ["IngredientID", "number", "Ingredient ID"],
      ["DeliveryID", "number", "Delivery ID"], ["OrderID", "number", "Order ID"],
      ["TransactionType", "text", "Transaction type"], ["Quantity", "number", "Quantity", { step: "0.01" }],
      ["TransactionDate", "date", "Transaction date"]
    ]
  },
  QualityIssue: {
    label: "Quality issues", icon: "⚑", id: "IssueID",
    fields: [
      ["IssueID", "number", "Issue ID"], ["OrderID", "number", "Order ID"],
      ["Description", "textarea", "Description"], ["DateReported", "date", "Date reported"],
      ["ResolutionStatus", "text", "Resolution status"]
    ]
  },
  DailyReport: {
    label: "Daily reports", icon: "▤", id: "ReportID",
    fields: [
      ["ReportID", "number", "Report ID"], ["StoreID", "number", "Store ID"],
      ["SupplierID", "number", "Supplier ID"], ["ReportDate", "date", "Report date"],
      ["TotalSales", "number", "Total sales", { step: "0.01" }],
      ["TotalOrders", "number", "Total orders"], ["IngredientUsageSummary", "textarea", "Ingredient usage summary"]
    ]
  }
};

const storageKey = "pizzahaus-admin-records-v1";
const resetKey = "pizzahaus-admin-demo-records-cleared-v1";
const initialRecords = {
  CustomerOrder: [],
  OrderDetails: [],
  MenuItem: [
    { MenuItemID: 1, ItemName: "Ham & Cheese", Price: 150 },
    { MenuItemID: 2, ItemName: "Hawaiian", Price: 150 },
    { MenuItemID: 3, ItemName: "Pepperoni", Price: 150 },
    { MenuItemID: 4, ItemName: "Pork Floss", Price: 180 },
    { MenuItemID: 5, ItemName: "Overload", Price: 190 },
    { MenuItemID: 6, ItemName: "PizzaHaus Special", Price: 220 },
    { MenuItemID: 7, ItemName: "Beef & Mushroom", Price: 180 },
    { MenuItemID: 8, ItemName: "Crab & Garlic", Price: 180 },
    { MenuItemID: 9, ItemName: "Chinese Sausage", Price: 180 },
    { MenuItemID: 10, ItemName: "Tuna & Corn", Price: 180 },
    { MenuItemID: 11, ItemName: "Bacon", Price: 180 },
    { MenuItemID: 12, ItemName: "Sisig", Price: 180 },
    { MenuItemID: 13, ItemName: "Cheese Burger", Price: 180 },
    { MenuItemID: 14, ItemName: "Combo A", Price: 225 },
    { MenuItemID: 15, ItemName: "Combo B", Price: 375 }
  ],
  Store: [
    { StoreID: 1, StoreName: "PizzaHaus Sipocot", Location: "Sipocot, Camarines Sur", OperatingHours: "Daily, 10:00 AM - 9:00 PM", ManagerName: "" },
    { StoreID: 2, StoreName: "PizzaHaus Naga City", Location: "Naga City, Camarines Sur", OperatingHours: "Daily, 10:00 AM - 9:00 PM", ManagerName: "" }
  ],
  Ingredient: [],
  Supplier: [],
  Delivery: [],
  InventoryTransaction: [],
  QualityIssue: [],
  DailyReport: []
};

const nav = document.querySelector("#side-nav");
const sidebar = document.querySelector("#sidebar");
const overviewPanel = document.querySelector("#overview-panel");
const dataPanel = document.querySelector("#data-panel");
const dialog = document.querySelector("#record-dialog");
const form = document.querySelector("#record-form");
const notice = document.querySelector("#notice");
let records;
let activeTable = null;
let editingId = null;
let searchTerm = "";
let adminRecordsError = null;
let customerOrdersError = null;

function cloneInitialRecords() {
  return JSON.parse(JSON.stringify(initialRecords));
}

function loadRecords() {
  try {
    if (localStorage.getItem(resetKey) !== "done") {
      localStorage.removeItem(storageKey);
      localStorage.setItem(resetKey, "done");
    }
    const saved = localStorage.getItem(storageKey);
    if (!saved) return cloneInitialRecords();
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) ||
        ["MenuItem", "Store"].some((key) => !Array.isArray(parsed[key])) ||
        Object.keys(parsed).some((key) => parsed[key] !== undefined && !Array.isArray(parsed[key]))) {
      throw new Error("Saved admin data has an unexpected format.");
    }
    const normalized = Object.fromEntries(Object.keys(schema).map((key) => [
      key,
      key === "CustomerOrder" || key === "OrderDetails"
        ? []
        : Array.isArray(parsed[key]) ? parsed[key] : initialRecords[key]
    ]));
    const hasRemovedData = Object.keys(parsed).some((key) => !Object.prototype.hasOwnProperty.call(schema, key))
      || Object.keys(schema).some((key) => !Array.isArray(parsed[key]))
      || (Array.isArray(parsed.CustomerOrder) && parsed.CustomerOrder.length > 0)
      || (Array.isArray(parsed.OrderDetails) && parsed.OrderDetails.length > 0);
    if (hasRemovedData) localStorage.setItem(storageKey, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.error("Unable to load admin records.", error);
    adminRecordsError = new Error("Saved admin records could not be loaded. Project menu and store data are shown; changes may not persist.");
    return cloneInitialRecords();
  }
}

function refreshCustomerOrders() {
  try {
    if (!window.PizzaHausData || typeof window.PizzaHausData.getOrders !== "function") {
      throw new Error("Customer order storage is unavailable. Reload the page and try again.");
    }
    const orders = window.PizzaHausData.getOrders();
    if (!Array.isArray(orders)) throw new Error("Saved customer orders have an unexpected format.");
    records.CustomerOrder = orders;
    records.OrderDetails = orders.flatMap((order) => {
      if (!Array.isArray(order.OrderItems)) return [];
      return order.OrderItems.map((item, index) => {
        const menuItem = records.MenuItem.find((entry) => entry.ItemName === item.ItemName);
        return {
          OrderDetailID: `${order.OrderID}-${index + 1}`,
          OrderID: order.OrderID,
          MenuItemID: menuItem ? menuItem.MenuItemID : "",
          Quantity: item.Quantity,
          Price: item.Price
        };
      });
    });
    customerOrdersError = null;
    return true;
  } catch (error) {
    console.error("Unable to load customer orders in admin.", error);
    customerOrdersError = error instanceof Error
      ? error
      : new Error("Customer orders could not be loaded from this browser.");
    records.CustomerOrder = [];
    records.OrderDetails = [];
    return false;
  }
}

function saveRecords() {
  try {
    const savedRecords = Object.fromEntries(Object.keys(schema).map((key) => [
      key,
      key === "CustomerOrder" ? [] : records[key]
    ]));
    localStorage.setItem(storageKey, JSON.stringify(savedRecords));
    return true;
  } catch (error) {
    console.error("Unable to save admin records.", error);
    showNotice("Could not save your changes in this browser. Check available storage and try again.", true);
    return false;
  }
}

function showNotice(message, isError) {
  notice.textContent = message;
  notice.classList.toggle("error", Boolean(isError));
  notice.hidden = false;
}

function clearNotice() {
  notice.hidden = true;
  notice.textContent = "";
  notice.classList.remove("error");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function formatValue(value) {
  if (value === "" || value === null || value === undefined) return "—";
  return escapeHtml(value);
}

function singularLabel(table) {
  return schema[table].label.toLowerCase().replace(/ies$/, "y").replace(/s$/, "");
}

function isReadOnlyTable(table) {
  return table === "CustomerOrder" || (Object.prototype.hasOwnProperty.call(schema, table) && schema[table].readOnly === true);
}

function renderNav() {
  nav.innerHTML = `<a class="nav-link active" href="#overview" data-table=""><span class="nav-icon">⌂</span>Overview</a>` +
    `<div class="nav-divider" role="separator"></div><p class="nav-section-label">WORKSPACE</p>` +
    Object.entries(schema).filter(([key]) => !["Store", "Supplier", "Ingredient", "MenuItem", "Delivery", "InventoryTransaction", "DailyReport", "QualityIssue"].includes(key)).map(([key, config]) =>
      `<a class="nav-link" href="#${encodeURIComponent(key)}" data-table="${key}"><span class="nav-icon">${config.icon}</span>${config.label}<span class="nav-count">${records[key].length}</span></a>`
    ).join("") +
    `<div class="nav-divider" role="separator"></div><p class="nav-section-label">INVENTORY</p>` +
    ["Ingredient", "MenuItem"].map((key) => {
      const config = schema[key];
      return `<a class="nav-link" href="#${encodeURIComponent(key)}" data-table="${key}"><span class="nav-icon">${config.icon}</span>${config.label}<span class="nav-count">${records[key].length}</span></a>`;
    }).join("") +
    `<div class="nav-divider" role="separator"></div><p class="nav-section-label">OPERATIONS</p>` +
    ["Delivery", "InventoryTransaction", "DailyReport", "QualityIssue"].map((key) => {
      const config = schema[key];
      return `<a class="nav-link" href="#${encodeURIComponent(key)}" data-table="${key}"><span class="nav-icon">${config.icon}</span>${config.label}<span class="nav-count">${records[key].length}</span></a>`;
    }).join("") +
    `<div class="nav-divider" role="separator"></div><p class="nav-section-label">LOCATIONS</p>` +
    ["Store", "Supplier"].map((key) => {
      const config = schema[key];
      return `<a class="nav-link" href="#${encodeURIComponent(key)}" data-table="${key}"><span class="nav-icon">${config.icon}</span>${config.label}<span class="nav-count">${records[key].length}</span></a>`;
    }).join("");

  nav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const key = link.dataset.table || null;
      navigate(key);
      sidebar.classList.remove("open");
      document.querySelector("#mobile-menu").setAttribute("aria-expanded", "false");
    });
  });
}

function navigate(table) {
  activeTable = table;
  searchTerm = "";
  document.querySelector("#table-search").value = "";
  clearNotice();
  const isOverview = !table;
  overviewPanel.hidden = !isOverview;
  dataPanel.hidden = isOverview;
  document.querySelector("#add-record").hidden = isOverview || isReadOnlyTable(table);
  document.querySelector("#breadcrumb-current").textContent = isOverview ? "Overview" : schema[table].label;
  document.querySelector("#page-title").textContent = isOverview ? "Overview" : schema[table].label;
  document.querySelector("#page-subtitle").textContent = isOverview
    ? "A snapshot of your restaurant operations."
    : table === "CustomerOrder"
    ? "Customer orders saved in this browser."
    : `Manage ${schema[table].label.toLowerCase()} and their related records.`;
  document.querySelector("#page-eyebrow").textContent = isOverview ? "PIZZAHAUS MANAGEMENT" : "DATA MANAGEMENT";
  nav.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", (link.dataset.table || null) === table));
  if (isOverview) renderOverview();
  else renderTable();
  window.location.hash = table || "overview";
}

function renderOverview() {
  const orderSales = records.CustomerOrder.reduce((sum, order) => sum + Number(order.Total || 0), 0);
  const manilaDateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const today = `${manilaDateParts.find((part) => part.type === "year").value}-${manilaDateParts.find((part) => part.type === "month").value}-${manilaDateParts.find((part) => part.type === "day").value}`;
  const ordersToday = customerOrdersError
    ? "Unavailable"
    : records.CustomerOrder.filter((order) => String(order.OrderDateTime || "").slice(0, 10) === today).length;
  const metrics = [
    ["Orders today", ordersToday, customerOrdersError ? "Customer orders could not be loaded" : "From this browser's customer orders", "▣"],
    ["Order value", customerOrdersError ? "Unavailable" : `₱${orderSales.toFixed(2)}`, "From this browser's customer orders", "₱"]
  ];
  const orders = customerOrdersError ? [] : [...records.CustomerOrder].sort((a, b) => String(b.OrderDateTime).localeCompare(String(a.OrderDateTime))).slice(0, 5);
  overviewPanel.innerHTML = `
    <div class="metrics-grid">${metrics.map(([label, value, hint, icon]) => `
      <article class="metric-card"><div class="metric-top">${label}<span class="metric-icon" aria-hidden="true">${icon}</span></div>
      <div class="metric-value">${escapeHtml(value)}</div><div class="metric-hint">${hint}</div></article>`).join("")}</div>
    <div class="overview-grid">
      <section class="overview-card">
        <div class="card-heading"><h2>Recent orders</h2><a class="text-link" href="#CustomerOrder" data-jump="CustomerOrder">View all →</a></div>
        ${orders.length ? `<div class="table-wrap"><table class="overview-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>STORE</th><th>METHOD</th><th>STATUS</th></tr></thead><tbody>
          ${orders.map((order) => `<tr><td>${formatValue(order.Reference || order.OrderID)}</td><td><span class="order-name">${formatValue(order.CustomerName)}</span><span class="sub-cell">${formatValue(order.OrderDateTime)}</span></td><td>${formatValue(order.StoreName || order.StoreID)}</td><td>${formatValue(order.PickupMethod)}</td><td>${renderStatusChip(order.Status || "Received")}</td></tr>`).join("")}
        </tbody></table></div>` : `<div class="empty-state">${customerOrdersError ? "Customer orders could not be loaded." : "No customer orders saved in this browser yet."}</div>`}
      </section>
      <section class="overview-card">
        <div class="card-heading"><h2>Stores</h2><a class="text-link" href="#Store" data-jump="Store">Manage stores →</a></div>
        <div class="stock-list">${records.Store.map((store) =>
        `<div class="stock-row"><div><strong>${formatValue(store.StoreName)}</strong><span>${formatValue(store.Location)}</span></div><span class="store-hours">${formatValue(store.OperatingHours)}</span></div>`
        ).join("") || `<div class="empty-state">No stores yet.</div>`}</div>
      </section>
    </div>`;
  overviewPanel.querySelectorAll("[data-jump]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    navigate(link.dataset.jump);
  }));
}

function renderOrderItemsCell(order) {
  const items = Array.isArray(order.OrderItems) ? order.OrderItems : [];
  if (!items.length) return '<span class="muted-copy">No items</span>';

  const total = Number(order.Total || items.reduce((sum, item) =>
    sum + Number(item.Quantity || 0) * Number(item.Price || 0), 0));
  const itemRows = items.map((item) => {
    const toppings = Array.isArray(item.Toppings)
      ? item.Toppings.map(formatValue).join(", ")
      : formatValue(item.Toppings);
    const options = [
      item.Size ? `${formatValue(item.Size)} in` : "",
      item.Crust ? formatValue(item.Crust) : "",
      toppings && toppings !== "—" ? `Toppings: ${toppings}` : ""
    ].filter(Boolean).join(" · ");
    return `<li><span>${formatValue(item.Quantity)} × ${formatValue(item.ItemName)} · ₱${Number(item.Price || 0).toFixed(2)}</span>${options ? `<span class="sub-cell">${options}</span>` : ""}</li>`;
  });
  return `<div class="order-items-summary"><ul>${itemRows.join("")}</ul><strong>Order total: ₱${total.toFixed(2)}</strong></div>`;
}

function renderTable() {
  const config = schema[activeTable];
  const hasOrderItems = activeTable === "CustomerOrder";
  const readOnly = isReadOnlyTable(activeTable);
  const visibleColumnCount = config.fields.length + (hasOrderItems ? 1 : 0) + (readOnly ? 0 : 1);
  document.querySelector("#table-title").textContent = config.label;
  document.querySelector("#table-head").innerHTML = `<tr>${config.fields.map(([, , label]) => `<th>${escapeHtml(label)}</th>`).join("")}${hasOrderItems ? "<th>ORDER ITEMS</th>" : ""}${readOnly ? "" : '<th class="actions-cell">ACTIONS</th>'}</tr>`;
  if ((hasOrderItems || activeTable === "OrderDetails") && customerOrdersError) {
    document.querySelector("#record-count").textContent = "Unavailable";
    document.querySelector("#table-summary").textContent = "Customer order data could not be loaded.";
    document.querySelector("#table-body").innerHTML = `<tr><td colspan="${visibleColumnCount}" class="empty-state">${formatValue(customerOrdersError.message)}</td></tr>`;
    return;
  }
  const filtered = records[activeTable].filter((record) => {
    const matchesRecord = Object.values(record).some((value) => String(value ?? "").toLowerCase().includes(searchTerm));
    const matchesOrderItems = hasOrderItems && Array.isArray(record.OrderItems)
      && record.OrderItems.some((item) =>
        Object.values(item).some((value) => String(value ?? "").toLowerCase().includes(searchTerm))
      );
    const menuItem = activeTable === "OrderDetails"
      ? records.MenuItem.find((item) => String(item.MenuItemID) === String(record.MenuItemID))
      : null;
    const matchesMenuItem = menuItem && String(menuItem.ItemName || "").toLowerCase().includes(searchTerm);
    return matchesRecord || matchesOrderItems || matchesMenuItem;
  });
  document.querySelector("#record-count").textContent = `${filtered.length} ${filtered.length === 1 ? "record" : "records"}`;
  document.querySelector("#table-summary").textContent = `${filtered.length} of ${records[activeTable].length} records`;
  document.querySelector("#table-body").innerHTML = filtered.length
    ? filtered.map((record) => `<tr>${config.fields.map(([key]) => `<td>${renderTableCell(record, key)}</td>`).join("")}
      ${hasOrderItems ? `<td>${renderOrderItemsCell(record)}</td>` : ""}
      ${readOnly ? "" : `<td class="actions-cell"><button class="row-action" type="button" data-edit="${escapeHtml(record[config.id])}">Edit</button><button class="row-action delete" type="button" data-delete="${escapeHtml(record[config.id])}">Delete</button></td>`}</tr>`).join("")
    : `<tr><td colspan="${visibleColumnCount}" class="empty-state">No matching records found.</td></tr>`;

  document.querySelector("#table-body").querySelectorAll("[data-edit]").forEach((button) =>
    button.addEventListener("click", () => openDialog(button.dataset.edit))
  );
  document.querySelector("#table-body").querySelectorAll("[data-delete]").forEach((button) =>
    button.addEventListener("click", () => deleteRecord(button.dataset.delete))
  );
}

function statusTone(value) {
  const status = String(value ?? "").toLowerCase();
  if (/\b(resolved|closed|complete|completed|received|active)\b/.test(status)) return "success";
  if (/pending|progress|preparing|processing/.test(status)) return "warning";
  if (/cancel|reject|failed|overdue|low/.test(status)) return "danger";
  return "neutral";
}

function renderStatusChip(value) {
  return `<span class="status-chip ${statusTone(value)}">${formatValue(value)}</span>`;
}

function renderTableCell(record, key) {
  if (/status$/i.test(key)) return renderStatusChip(record[key]);
  if (activeTable === "OrderDetails" && key === "MenuItemID") {
    const menuItem = records.MenuItem.find((item) => String(item.MenuItemID) === String(record.MenuItemID));
    return menuItem ? `${formatValue(record[key])} · ${formatValue(menuItem.ItemName)}` : formatValue(record[key]);
  }
  return formatValue(record[key]);
}

function openDialog(id) {
  if (isReadOnlyTable(activeTable)) {
    showNotice("This data is read-only in admin.", true);
    return;
  }
  editingId = id === undefined ? null : String(id);
  const config = schema[activeTable];
  const record = editingId === null
    ? { [config.id]: nextId(activeTable) }
    : records[activeTable].find((item) => String(item[config.id]) === editingId);
  if (!record) {
    showNotice("That record could not be found. Refresh the table and try again.", true);
    return;
  }
  document.querySelector("#dialog-title").textContent = `${editingId === null ? "Add" : "Edit"} ${singularLabel(activeTable)}`;
  document.querySelector("#form-fields").innerHTML = config.fields.map(([key, type, label, options]) => {
    const required = key === config.id || (key.endsWith("Name") && key !== "ManagerName") || key === "ItemName" || key === "Description";
    const inputId = `field-${key}`;
    const value = record[key] ?? "";
    const common = `id="${inputId}" name="${escapeHtml(key)}" ${required ? "required" : ""} ${key === config.id && editingId !== null ? "disabled" : ""}`;
    if (type === "textarea") return `<div class="field full-width"><label for="${inputId}">${escapeHtml(label)}${required ? " *" : ""}</label><textarea ${common}>${escapeHtml(value)}</textarea></div>`;
    return `<div class="field"><label for="${inputId}">${escapeHtml(label)}${required ? " *" : ""}</label><input type="${type}" ${common}${options ? ` ${Object.entries(options).map(([name, option]) => `${name}="${escapeHtml(option)}"`).join(" ")}` : ""} value="${escapeHtml(value)}"></div>`;
  }).join("");
  dialog.showModal();
  const firstEditable = dialog.querySelector("input:not(:disabled), textarea:not(:disabled)");
  if (firstEditable) firstEditable.focus();
}

function nextId(table) {
  const key = schema[table].id;
  return records[table].reduce((max, record) => Math.max(max, Number(record[key]) || 0), 0) + 1;
}

function deleteRecord(id) {
  if (isReadOnlyTable(activeTable)) {
    showNotice("This data is read-only in admin.", true);
    return;
  }
  const config = schema[activeTable];
  const record = records[activeTable].find((item) => String(item[config.id]) === String(id));
  if (!record || !window.confirm(`Delete ${singularLabel(activeTable)} #${id}? This cannot be undone.`)) return;
  const original = records[activeTable];
  records[activeTable] = original.filter((item) => String(item[config.id]) !== String(id));
  if (!saveRecords()) {
    records[activeTable] = original;
    return;
  }
  renderNav();
  renderTable();
  showNotice("Record deleted.");
}

document.querySelector("#table-search").addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderTable();
});

document.querySelector("#add-record").addEventListener("click", () => openDialog());
document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-dialog").addEventListener("click", () => dialog.close());
document.querySelector("#mobile-menu").addEventListener("click", (event) => {
  const open = sidebar.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
});
document.querySelector("#sidebar-collapse").addEventListener("click", (event) => {
  const collapsed = document.documentElement.classList.toggle("sidebar-collapsed");
  event.currentTarget.setAttribute("aria-pressed", String(collapsed));
  event.currentTarget.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
  event.currentTarget.textContent = collapsed ? "⇥" : "⇤";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!activeTable) return;
  if (isReadOnlyTable(activeTable)) {
    showNotice("This data is read-only in admin.", true);
    return;
  }
  const config = schema[activeTable];
  const values = Object.fromEntries(new FormData(form).entries());
  config.fields.forEach(([key, type]) => {
    if (type === "number" && Object.prototype.hasOwnProperty.call(values, key) && values[key] !== "") {
      values[key] = Number(values[key]);
    }
  });

  if (editingId !== null) {
    const index = records[activeTable].findIndex((item) => String(item[config.id]) === editingId);
    if (index < 0) {
      dialog.close();
      showNotice("That record no longer exists. Refresh the table and try again.", true);
      return;
    }
    records[activeTable][index] = { ...records[activeTable][index], ...values };
  } else {
    records[activeTable].push(values);
  }
  if (!saveRecords()) return;
  dialog.close();
  renderNav();
  renderTable();
  showNotice(editingId === null ? "Record added." : "Record updated.");
});

window.addEventListener("hashchange", () => {
  const table = window.location.hash.slice(1);
  const nextTable = Object.prototype.hasOwnProperty.call(schema, table) ? table : null;
  if (nextTable !== activeTable) navigate(nextTable);
});

window.addEventListener("storage", (event) => {
  const data = window.PizzaHausData;
  if (!data || event.key !== data.orderStorageKey) return;
  const ordersLoaded = refreshCustomerOrders();
  renderNav();
  if (activeTable === "CustomerOrder" || activeTable === "OrderDetails") renderTable();
  else if (activeTable === null) renderOverview();
  if (!ordersLoaded) showNotice(customerOrdersError.message, true);
});

records = loadRecords();
refreshCustomerOrders();
renderNav();
const requestedTable = decodeURIComponent(window.location.hash.slice(1));
const initialTable = Object.prototype.hasOwnProperty.call(schema, requestedTable) ? requestedTable : null;
navigate(initialTable);
const startupErrors = [adminRecordsError, customerOrdersError].filter(Boolean);
if (startupErrors.length) showNotice(startupErrors.map((error) => error.message).join(" "), true);