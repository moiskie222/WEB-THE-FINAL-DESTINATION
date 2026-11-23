const schema = JSON.parse(document.querySelector("#admin-schema").textContent);

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
const supplierPanel = document.querySelector("#supplier-panel");
const dialog = document.querySelector("#record-dialog");
const deleteConfirmationDialog = document.querySelector("#delete-confirmation-dialog");
const form = document.querySelector("#record-form");
const notice = document.querySelector("#notice");
let records;
let activeTable = null;
let editingId = null;
let dialogTable = null;
let dialogLockedFields = {};
let selectedSupplierId = null;
let resolveDeleteConfirmation = null;
let searchTerm = "";
let adminRecordsError = null;
let customerOrdersError = null;
let noticeTimer = null;

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
  const error = Boolean(isError);
  window.clearTimeout(noticeTimer);
  noticeTimer = null;
  notice.querySelector("[data-notice-icon]").textContent = error ? "!" : "✓";
  notice.querySelector("[data-notice-title]").textContent = error ? "Needs attention" : "Done!";
  notice.querySelector("[data-notice-message]").textContent = message;
  notice.classList.toggle("error", error);
  notice.setAttribute("role", error ? "alert" : "status");
  notice.setAttribute("aria-live", error ? "assertive" : "polite");
  notice.hidden = false;
  if (!error) noticeTimer = window.setTimeout(clearNotice, 5000);
}

function clearNotice() {
  window.clearTimeout(noticeTimer);
  noticeTimer = null;
  notice.hidden = true;
  notice.querySelector("[data-notice-icon]").textContent = "";
  notice.querySelector("[data-notice-title]").textContent = "";
  notice.querySelector("[data-notice-message]").textContent = "";
  notice.classList.remove("error");
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
}

function confirmRecordDeletion(record, table, id) {
  const displayFields = ["SupplierName", "StoreName", "ItemName", "IngredientName", "CustomerName", "Reference"];
  const displayField = displayFields.find((key) => record[key]);
  const recordName = displayField ? `“${record[displayField]}”` : `${singularLabel(table)} #${id}`;
  document.querySelector("#delete-confirmation-title").textContent = `Delete ${singularLabel(table)}?`;
  document.querySelector("#delete-confirmation-message").textContent =
    `Are you sure you want to delete ${recordName}? This action cannot be undone.`;
  return new Promise((resolve) => {
    resolveDeleteConfirmation = resolve;
    deleteConfirmationDialog.showModal();
  });
}

function finishDeleteConfirmation(confirmed) {
  if (!deleteConfirmationDialog.open) return;
  const resolve = resolveDeleteConfirmation;
  resolveDeleteConfirmation = null;
  deleteConfirmationDialog.close();
  if (resolve) resolve(confirmed);
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

function isSupplierManagedTable(table) {
  return table === "Delivery" || table === "InventoryTransaction";
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
  if (isSupplierManagedTable(table)) table = "Supplier";
  selectedSupplierId = null;
  activeTable = table;
  searchTerm = "";
  document.querySelector("#table-search").value = "";
  clearNotice();
  const isOverview = !table;
  overviewPanel.hidden = !isOverview;
  dataPanel.hidden = isOverview;
  supplierPanel.hidden = true;
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

function openSupplierDetails(id) {
  const supplier = records.Supplier.find((item) => String(item.SupplierID) === String(id));
  if (!supplier) {
    showNotice("That supplier could not be found. Refresh the list and try again.", true);
    return;
  }
  clearNotice();
  selectedSupplierId = String(supplier.SupplierID);
  overviewPanel.hidden = true;
  dataPanel.hidden = true;
  supplierPanel.hidden = false;
  document.querySelector("#add-record").hidden = true;
  document.querySelector("#breadcrumb-current").textContent = supplier.SupplierName || "Supplier";
  document.querySelector("#page-title").textContent = supplier.SupplierName || "Supplier";
  document.querySelector("#page-subtitle").textContent = "Manage this supplier's deliveries and their transactions.";
  document.querySelector("#page-eyebrow").textContent = "SUPPLIER MANAGEMENT";
  renderNav();
  renderSupplierDetails(supplier);
  window.location.hash = "Supplier";
}

function renderSupplierDetails(supplier) {
  document.querySelector("[data-supplier-name]").textContent = supplier.SupplierName || "Supplier";
  document.querySelector("[data-supplier-contact]").textContent = supplier.ContactInfo || "No contact information";
  document.querySelector("[data-supplier-address]").textContent = supplier.Address || "No address saved";

  const deliveryList = document.querySelector("#supplier-deliveries");
  const deliveries = records.Delivery.filter((delivery) =>
    String(delivery.SupplierID) === String(supplier.SupplierID)
  );
  if (!deliveries.length) {
    const empty = document.createElement("div");
    empty.className = "overview-card empty-state";
    empty.textContent = "No deliveries for this supplier yet. Use Add delivery to create one.";
    deliveryList.replaceChildren(empty);
    return;
  }

  const cards = deliveries.map((delivery) => {
    const card = cloneTemplate("supplier-delivery-template");
    const deliveryId = String(delivery.DeliveryID);
    card.dataset.deliveryId = deliveryId;
    card.querySelector("[data-delivery-id]").textContent = deliveryId;
    card.querySelector("[data-delivery-summary]").textContent = [
      delivery.DeliveryDate || "No date",
      delivery.StoreID ? `Store ${delivery.StoreID}` : "No store",
      `Quantity: ${delivery.TotalQuantity ?? "—"}`
    ].join(" · ");
    card.querySelector("[data-edit-delivery]").dataset.editDelivery = deliveryId;
    card.querySelector("[data-delete-delivery]").dataset.deleteDelivery = deliveryId;
    card.querySelector("[data-add-transaction]").dataset.addTransaction = deliveryId;

    const transactions = records.InventoryTransaction.filter((transaction) =>
      String(transaction.DeliveryID) === deliveryId
    );
    const rows = card.querySelector("[data-transaction-rows]");
    rows.replaceChildren(...transactions.map((transaction) => {
      const row = cloneTemplate("supplier-transaction-row-template");
      const ingredient = records.Ingredient.find((item) =>
        String(item.IngredientID) === String(transaction.IngredientID)
      );
      row.querySelector("[data-transaction-id]").textContent = transaction.TransactionID ?? "—";
      row.querySelector("[data-transaction-ingredient]").textContent =
        ingredient ? ingredient.IngredientName : transaction.IngredientID ?? "—";
      row.querySelector("[data-transaction-type]").textContent = transaction.TransactionType || "—";
      row.querySelector("[data-transaction-quantity]").textContent = transaction.Quantity ?? "—";
      row.querySelector("[data-transaction-date]").textContent = transaction.TransactionDate || "—";
      row.querySelector("[data-edit-transaction]").dataset.editTransaction = transaction.TransactionID;
      row.querySelector("[data-delete-transaction]").dataset.deleteTransaction = transaction.TransactionID;
      return row;
    }));
    card.querySelector("[data-empty-transactions]").hidden = transactions.length > 0;
    return card;
  });
  deliveryList.replaceChildren(...cards);
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
  config.fields.forEach(([key, type, label]) => {
    const header = document.createElement("th");
    header.textContent = label;
    if (shouldCenterField(key, type)) header.classList.add("centered-column");
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
      config.fields.forEach(([key, type]) => {
        const cell = document.createElement("td");
        if (shouldCenterField(key, type)) cell.classList.add("centered-column");
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
        const openSupplierButton = actions.querySelector("[data-open-supplier]");
        openSupplierButton.hidden = activeTable !== "Supplier";
        if (activeTable === "Supplier") openSupplierButton.dataset.openSupplier = record[config.id];
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
  body.querySelectorAll("[data-open-supplier]").forEach((button) =>
    button.addEventListener("click", () => openSupplierDetails(button.dataset.openSupplier))
  );
}

function shouldCenterField(key, type) {
  return activeTable === "Supplier" || type === "number" || type === "date" || type === "tel" ||
    /(?:ID|Status|Date(?:Time)?)$/i.test(key);
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

function openDialog(id, table, lockedFields) {
  const targetTable = table || activeTable;
  if (isReadOnlyTable(targetTable)) {
    showNotice("This data is read-only in admin.", true);
    return;
  }
  dialogTable = targetTable;
  dialogLockedFields = lockedFields || {};
  editingId = id === undefined ? null : String(id);
  const config = schema[dialogTable];
  const record = editingId === null
    ? { [config.id]: nextId(dialogTable), ...dialogLockedFields }
    : records[dialogTable].find((item) => String(item[config.id]) === editingId);
  if (!record) {
    showNotice("That record could not be found. Refresh the table and try again.", true);
    return;
  }
  document.querySelector("#dialog-title").textContent = `${editingId === null ? "Add" : "Edit"} ${singularLabel(dialogTable)}`;
  const formFields = document.querySelector("#form-fields");
  formFields.replaceChildren();
  config.fields.forEach(([key, type, label, options]) => {
    const required = key === config.id || (key.endsWith("Name") && key !== "ManagerName") || key === "ItemName" || key === "Description" ||
      Object.prototype.hasOwnProperty.call(dialogLockedFields, key);
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
    control.disabled = (key === config.id && editingId !== null) ||
      Object.prototype.hasOwnProperty.call(dialogLockedFields, key);
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

async function deleteRecord(id, table) {
  const targetTable = table || activeTable;
  if (isReadOnlyTable(targetTable)) {
    showNotice("This data is read-only in admin.", true);
    return;
  }
  if (targetTable === "Supplier" && records.Delivery.some((delivery) => String(delivery.SupplierID) === String(id))) {
    showNotice("This supplier has deliveries. Remove or reassign those deliveries before deleting the supplier.", true);
    return;
  }
  if (targetTable === "Delivery" && records.InventoryTransaction.some((transaction) => String(transaction.DeliveryID) === String(id))) {
    showNotice("This delivery has transactions. Delete those transactions before deleting the delivery.", true);
    return;
  }
  const config = schema[targetTable];
  const record = records[targetTable].find((item) => String(item[config.id]) === String(id));
  if (!record) return;
  const confirmed = await confirmRecordDeletion(record, targetTable, id);
  if (!confirmed) return;
  if (!records[targetTable].some((item) => String(item[config.id]) === String(id))) {
    showNotice("This record is no longer available. Refresh the list and try again.", true);
    return;
  }
  const original = records[targetTable];
  records[targetTable] = original.filter((item) => String(item[config.id]) !== String(id));
  if (!saveRecords()) {
    records[targetTable] = original;
    return;
  }
  renderNav();
  if (activeTable === "Supplier" && selectedSupplierId !== null) {
    const supplier = records.Supplier.find((item) => String(item.SupplierID) === selectedSupplierId);
    if (supplier) renderSupplierDetails(supplier);
    else navigate("Supplier");
  } else renderTable();
  showNotice("Record deleted.");
}

document.querySelector("#table-search").addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderTable();
});

notice.querySelector(".notice-dismiss").addEventListener("click", clearNotice);
deleteConfirmationDialog.querySelector("[data-cancel-delete]").addEventListener("click", () =>
  finishDeleteConfirmation(false)
);
deleteConfirmationDialog.querySelector("[data-confirm-delete]").addEventListener("click", () =>
  finishDeleteConfirmation(true)
);
deleteConfirmationDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  finishDeleteConfirmation(false);
});

supplierPanel.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.hasAttribute("data-back-suppliers")) {
    navigate("Supplier");
    return;
  }
  const supplier = records.Supplier.find((item) => String(item.SupplierID) === selectedSupplierId);
  if (!supplier) {
    showNotice("The selected supplier could not be found. Return to the supplier list and try again.", true);
    return;
  }
  if (button.hasAttribute("data-add-delivery")) {
    openDialog(undefined, "Delivery", { SupplierID: supplier.SupplierID });
    return;
  }
  if (button.hasAttribute("data-add-transaction")) {
    openDialog(undefined, "InventoryTransaction", { DeliveryID: Number(button.dataset.addTransaction) });
    return;
  }
  if (button.hasAttribute("data-edit-delivery")) {
    openDialog(button.dataset.editDelivery, "Delivery", { SupplierID: supplier.SupplierID });
    return;
  }
  if (button.hasAttribute("data-delete-delivery")) {
    deleteRecord(button.dataset.deleteDelivery, "Delivery");
    return;
  }
  const deliveryCard = button.closest(".supplier-delivery-card");
  const deliveryId = deliveryCard ? deliveryCard.dataset.deliveryId : "";
  if (button.hasAttribute("data-edit-transaction")) {
    openDialog(button.dataset.editTransaction, "InventoryTransaction", { DeliveryID: Number(deliveryId) });
    return;
  }
  if (button.hasAttribute("data-delete-transaction")) {
    deleteRecord(button.dataset.deleteTransaction, "InventoryTransaction");
  }
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
  const table = dialogTable || activeTable;
  if (!table) return;
  if (isReadOnlyTable(table)) {
    showNotice("This data is read-only in admin.", true);
    return;
  }
  const config = schema[table];
  const values = Object.fromEntries(new FormData(form).entries());
  Object.assign(values, dialogLockedFields);
  config.fields.forEach(([key, type]) => {
    if (type === "number" && Object.prototype.hasOwnProperty.call(values, key) && values[key] !== "") {
      values[key] = Number(values[key]);
    }
  });

  const wasEditing = editingId !== null;
  if (editingId !== null) {
    const index = records[table].findIndex((item) => String(item[config.id]) === editingId);
    if (index < 0) {
      dialog.close();
      showNotice("That record no longer exists. Refresh the table and try again.", true);
      return;
    }
    records[table][index] = { ...records[table][index], ...values };
  } else {
    records[table].push(values);
  }
  if (!saveRecords()) return;
  dialog.close();
  dialogTable = null;
  dialogLockedFields = {};
  renderNav();
  if (activeTable === "Supplier" && selectedSupplierId !== null) {
    const supplier = records.Supplier.find((item) => String(item.SupplierID) === selectedSupplierId);
    if (supplier) renderSupplierDetails(supplier);
    else navigate("Supplier");
  } else renderTable();
  showNotice(wasEditing ? "Record updated." : "Record added.");
});

window.addEventListener("hashchange", () => {
  const table = decodeURIComponent(window.location.hash.slice(1));
  const nextTable = isSupplierManagedTable(table)
    ? "Supplier"
    : Object.prototype.hasOwnProperty.call(schema, table) ? table : null;
  if (nextTable !== activeTable || isSupplierManagedTable(table)) navigate(nextTable);
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
const initialTable = isSupplierManagedTable(requestedTable)
  ? "Supplier"
  : Object.prototype.hasOwnProperty.call(schema, requestedTable) ? requestedTable : null;
navigate(initialTable);
const startupErrors = [adminRecordsError, customerOrdersError].filter(Boolean);
if (startupErrors.length) showNotice(startupErrors.map((error) => error.message).join(" "), true);