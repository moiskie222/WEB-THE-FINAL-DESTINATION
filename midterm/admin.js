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
      key === "CustomerOrder" || key === "OrderDetails" ? [] : records[key]
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

function cloneTemplate(id) {
  const template = document.getElementById(id);
  if (!template || !template.content.firstElementChild) {
    throw new Error(`The "${id}" HTML template is missing.`);
  }
  return template.content.firstElementChild.cloneNode(true);
}

function singularLabel(table) {
  return schema[table].label.toLowerCase().replace(/ies$/, "y").replace(/s$/, "");
}

function isReadOnlyTable(table) {
  return table === "CustomerOrder" || (Object.prototype.hasOwnProperty.call(schema, table) && schema[table].readOnly === true);
}

function renderNav() {
  Object.entries(records).forEach(([key, rows]) => {
    const count = nav.querySelector(`[data-nav-count="${key}"]`);
    if (count) count.textContent = rows.length;
  });
  nav.querySelectorAll(".nav-link").forEach((link) =>
    link.classList.toggle("active", (link.dataset.table || null) === activeTable)
  );
}

nav.addEventListener("click", (event) => {
  const link = event.target.closest(".nav-link");
  if (!link) return;
  event.preventDefault();
  navigate(link.dataset.table || null);
  sidebar.classList.remove("open");
  document.querySelector("#mobile-menu").setAttribute("aria-expanded", "false");
});

overviewPanel.addEventListener("click", (event) => {
  const link = event.target.closest("[data-jump]");
  if (!link) return;
  event.preventDefault();
  navigate(link.dataset.jump);
});

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
  const metricsGrid = document.querySelector("#overview-metrics");
  metricsGrid.replaceChildren(...metrics.map(([label, value, hint, icon]) => {
    const card = cloneTemplate("metric-card-template");
    card.querySelector("[data-metric-label]").textContent = label;
    card.querySelector("[data-metric-value]").textContent = value;
    card.querySelector("[data-metric-hint]").textContent = hint;
    card.querySelector("[data-metric-icon]").textContent = icon;
    return card;
  }));

  const orderRows = document.querySelector("#recent-order-rows");
  orderRows.replaceChildren();
  if (!orders.length) {
    const emptyRow = cloneTemplate("empty-table-row-template");
    emptyRow.querySelector("[data-empty-table]").colSpan = 5;
    emptyRow.querySelector("[data-empty-table]").textContent = customerOrdersError
      ? "Customer orders could not be loaded."
      : "No customer orders saved in this browser yet.";
    orderRows.append(emptyRow);
  } else {
    orders.forEach((order) => {
      const row = cloneTemplate("recent-order-row-template");
      row.querySelector("[data-order-reference]").textContent = order.Reference || order.OrderID;
      row.querySelector("[data-order-customer]").textContent = order.CustomerName || "—";
      row.querySelector("[data-order-date]").textContent = order.OrderDateTime || "—";
      row.querySelector("[data-order-store]").textContent = order.StoreName || order.StoreID || "—";
      row.querySelector("[data-order-method]").textContent = order.PickupMethod || "—";
      row.querySelector("[data-order-status]").append(renderStatusChip(order.Status || "Received"));
      orderRows.append(row);
    });
  }

  const stores = document.querySelector("#overview-stores");
  stores.replaceChildren();
  if (!records.Store.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No stores yet.";
    stores.append(emptyState);
  } else {
    records.Store.forEach((store) => {
      const row = cloneTemplate("overview-store-row-template");
      row.querySelector("[data-store-name]").textContent = store.StoreName || "—";
      row.querySelector("[data-store-location]").textContent = store.Location || "—";
      row.querySelector("[data-store-hours]").textContent = store.OperatingHours || "—";
      stores.append(row);
    });
  }
}

function renderOrderItemsCell(order) {
  const items = Array.isArray(order.OrderItems) ? order.OrderItems : [];
  if (!items.length) {
    const empty = document.createElement("span");
    empty.className = "muted-copy";
    empty.textContent = "No items";
    return empty;
  }

  const total = Number(order.Total || items.reduce((sum, item) =>
    sum + Number(item.Quantity || 0) * Number(item.Price || 0), 0));
  const summary = cloneTemplate("order-items-template");
  const itemList = summary.querySelector("[data-order-items]");
  items.forEach((item) => {
    const toppings = Array.isArray(item.Toppings)
      ? item.Toppings.join(", ")
      : item.Toppings;
    const options = [
      item.Size ? `${item.Size} in` : "",
      item.Crust || "",
      toppings ? `Toppings: ${toppings}` : ""
    ].filter(Boolean).join(" · ");
    const row = cloneTemplate("order-item-template");
    row.querySelector("[data-order-item]").textContent =
      `${item.Quantity ?? "—"} × ${item.ItemName || "—"} · ₱${Number(item.Price || 0).toFixed(2)}`;
    const optionsElement = row.querySelector("[data-order-options]");
    optionsElement.textContent = options;
    optionsElement.hidden = !options;
    itemList.append(row);
  });
  summary.querySelector("[data-order-total]").textContent = `Order total: ₱${total.toFixed(2)}`;
  return summary;
}

function renderTable() {
  const config = schema[activeTable];
  const hasOrderItems = activeTable === "CustomerOrder";
  const readOnly = isReadOnlyTable(activeTable);
  const visibleColumnCount = config.fields.length + (hasOrderItems ? 1 : 0) + (readOnly ? 0 : 1);
  document.querySelector("#table-title").textContent = config.label;
  const headerRow = document.createElement("tr");
  config.fields.forEach(([, , label]) => {
    const header = document.createElement("th");
    header.textContent = label;
    headerRow.append(header);
  });
  if (hasOrderItems) {
    const header = document.createElement("th");
    header.textContent = "ORDER ITEMS";
    headerRow.append(header);
  }
  if (!readOnly) {
    const header = document.createElement("th");
    header.className = "actions-cell";
    header.textContent = "ACTIONS";
    headerRow.append(header);
  }
  document.querySelector("#table-head").replaceChildren(headerRow);
  const body = document.querySelector("#table-body");
  if ((hasOrderItems || activeTable === "OrderDetails") && customerOrdersError) {
    document.querySelector("#record-count").textContent = "Unavailable";
    document.querySelector("#table-summary").textContent = "Customer order data could not be loaded.";
    const errorRow = cloneTemplate("empty-table-row-template");
    errorRow.querySelector("[data-empty-table]").colSpan = visibleColumnCount;
    errorRow.querySelector("[data-empty-table]").textContent = customerOrdersError.message;
    body.replaceChildren(errorRow);
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
  if (!filtered.length) {
    const emptyRow = cloneTemplate("empty-table-row-template");
    emptyRow.querySelector("[data-empty-table]").colSpan = visibleColumnCount;
    emptyRow.querySelector("[data-empty-table]").textContent = "No matching records found.";
    body.replaceChildren(emptyRow);
  } else {
    const rows = filtered.map((record) => {
      const row = cloneTemplate("data-row-template");
      config.fields.forEach(([key]) => {
        const cell = document.createElement("td");
        const value = renderTableCell(record, key);
        if (value instanceof Node) cell.append(value);
        else cell.textContent = value;
        row.append(cell);
      });
      if (hasOrderItems) {
        const cell = document.createElement("td");
        cell.append(renderOrderItemsCell(record));
        row.append(cell);
      }
      if (!readOnly) {
        const actions = cloneTemplate("table-actions-template");
        actions.querySelector("[data-edit]").dataset.edit = record[config.id];
        actions.querySelector("[data-delete]").dataset.delete = record[config.id];
        row.append(actions);
      }
      return row;
    });
    body.replaceChildren(...rows);
  }

  body.querySelectorAll("[data-edit]").forEach((button) =>
    button.addEventListener("click", () => openDialog(button.dataset.edit))
  );
  body.querySelectorAll("[data-delete]").forEach((button) =>
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
  const chip = cloneTemplate("status-chip-template");
  chip.classList.add(statusTone(value));
  chip.textContent = value || "—";
  return chip;
}

function renderTableCell(record, key) {
  if (/status$/i.test(key)) return renderStatusChip(record[key]);
  if (activeTable === "OrderDetails" && key === "MenuItemID") {
    const menuItem = records.MenuItem.find((item) => String(item.MenuItemID) === String(record.MenuItemID));
    return menuItem ? `${record[key]} · ${menuItem.ItemName}` : String(record[key] ?? "—");
  }
  return String(record[key] ?? "—");
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
  const formFields = document.querySelector("#form-fields");
  formFields.replaceChildren();
  config.fields.forEach(([key, type, label, options]) => {
    const required = key === config.id || (key.endsWith("Name") && key !== "ManagerName") || key === "ItemName" || key === "Description";
    const inputId = `field-${key}`;
    const value = record[key] ?? "";
    const field = cloneTemplate(type === "textarea" ? "field-textarea-template" : "field-input-template");
    const fieldLabel = field.querySelector("[data-field-label]");
    const control = field.querySelector("[data-field-control]");
    fieldLabel.htmlFor = inputId;
    fieldLabel.textContent = `${label}${required ? " *" : ""}`;
    control.id = inputId;
    control.name = key;
    control.required = required;
    control.disabled = key === config.id && editingId !== null;
    if (type === "textarea") control.value = value;
    else {
      control.type = type;
      control.value = value;
      Object.entries(options || {}).forEach(([name, option]) => control.setAttribute(name, option));
    }
    formFields.append(field);
  });
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