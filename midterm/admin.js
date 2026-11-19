const schema = {
  CustomerOrder: {
    label: "Orders", icon: "▣", id: "OrderID",
    fields: [
      ["OrderID", "number", "Order ID"], ["StoreID", "number", "Store ID"],
      ["CustomerName", "text", "Customer name"], ["ContactNumber", "tel", "Contact number"],
      ["PickupMethod", "text", "Pickup method"], ["OrderDateTime", "datetime-local", "Order date & time"]
    ]
  },
  OrderDetails: {
    label: "Order details", icon: "☷", id: "OrderDetailID",
    fields: [
      ["OrderDetailID", "number", "Order detail ID"], ["OrderID", "number", "Order ID"],
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
    label: "Inventory", icon: "↕", id: "TransactionID",
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
const seedData = {
  CustomerOrder: [
    { OrderID: 1001, StoreID: 1, CustomerName: "Mia Thompson", ContactNumber: "555-0142", PickupMethod: "Pickup", OrderDateTime: "2026-11-19T10:15" },
    { OrderID: 1002, StoreID: 1, CustomerName: "Noah Williams", ContactNumber: "555-0188", PickupMethod: "Delivery", OrderDateTime: "2026-11-19T10:42" },
    { OrderID: 1003, StoreID: 2, CustomerName: "Ava Chen", ContactNumber: "555-0115", PickupMethod: "Pickup", OrderDateTime: "2026-11-19T11:05" }
  ],
  OrderDetails: [
    { OrderDetailID: 1, OrderID: 1001, MenuItemID: 1, Quantity: 2, Price: 13.5 },
    { OrderDetailID: 2, OrderID: 1002, MenuItemID: 3, Quantity: 1, Price: 16.0 },
    { OrderDetailID: 3, OrderID: 1003, MenuItemID: 2, Quantity: 1, Price: 14.0 }
  ],
  MenuItem: [
    { MenuItemID: 1, ItemName: "Margherita", Price: 13.5 },
    { MenuItemID: 2, ItemName: "Garden Party", Price: 14.0 },
    { MenuItemID: 3, ItemName: "House Special", Price: 16.0 }
  ],
  Store: [
    { StoreID: 1, StoreName: "Downtown", Location: "Central district", OperatingHours: "10:00 AM – 10:00 PM", ManagerName: "Jordan Lee" },
    { StoreID: 2, StoreName: "Riverside", Location: "Riverside avenue", OperatingHours: "10:00 AM – 9:00 PM", ManagerName: "Casey Morgan" }
  ],
  Ingredient: [
    { IngredientID: 1, IngredientName: "Mozzarella", UnitMeasure: "kg", CurrentStock: 4.5, ReorderLevel: 8 },
    { IngredientID: 2, IngredientName: "Tomato sauce", UnitMeasure: "litre", CurrentStock: 3, ReorderLevel: 6 },
    { IngredientID: 3, IngredientName: "Pizza flour", UnitMeasure: "kg", CurrentStock: 22, ReorderLevel: 10 },
    { IngredientID: 4, IngredientName: "Fresh basil", UnitMeasure: "bunch", CurrentStock: 2, ReorderLevel: 4 }
  ],
  Supplier: [
    { SupplierID: 1, SupplierName: "Fresh Foods Co.", ContactInfo: "hello@freshfoods.example", Address: "18 Market Street" },
    { SupplierID: 2, SupplierName: "Miller's Pantry", ContactInfo: "555-0191", Address: "42 Mill Road" }
  ],
  Delivery: [
    { DeliveryID: 1, SupplierID: 1, StoreID: 1, DeliveryDate: "2026-11-19", TotalQuantity: 32 },
    { DeliveryID: 2, SupplierID: 2, StoreID: 2, DeliveryDate: "2026-11-18", TotalQuantity: 45 }
  ],
  InventoryTransaction: [
    { TransactionID: 1, IngredientID: 1, DeliveryID: 1, OrderID: 0, TransactionType: "Delivery", Quantity: 12, TransactionDate: "2026-11-19" },
    { TransactionID: 2, IngredientID: 2, DeliveryID: 0, OrderID: 1001, TransactionType: "Usage", Quantity: 0.4, TransactionDate: "2026-11-19" }
  ],
  QualityIssue: [
    { IssueID: 1, OrderID: 1002, Description: "Order arrived later than expected.", DateReported: "2026-11-19", ResolutionStatus: "In progress" },
    { IssueID: 2, OrderID: 998, Description: "Incorrect topping on the order.", DateReported: "2026-11-18", ResolutionStatus: "Resolved" }
  ],
  DailyReport: [
    { ReportID: 1, StoreID: 1, SupplierID: 1, ReportDate: "2026-11-18", TotalSales: 842.5, TotalOrders: 57, IngredientUsageSummary: "Flour 8kg, mozzarella 5kg, tomato sauce 4L" },
    { ReportID: 2, StoreID: 2, SupplierID: 2, ReportDate: "2026-11-18", TotalSales: 615.0, TotalOrders: 42, IngredientUsageSummary: "Flour 6kg, mozzarella 4kg, tomato sauce 3L" }
  ]
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

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedData));
}

function loadRecords() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return cloneSeed();
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Object.keys(schema).some((key) => !Array.isArray(parsed[key]))) {
      throw new Error("Saved admin data has an unexpected format.");
    }
    return parsed;
  } catch (error) {
    console.error("Unable to load admin records.", error);
    showNotice("Could not load saved data. The sample records are shown; changes may not persist.", true);
    return cloneSeed();
  }
}

function saveRecords() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(records));
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

function renderNav() {
  nav.innerHTML = `<a class="nav-link active" href="#overview" data-table=""><span class="nav-icon">⌂</span>Overview</a>` +
    Object.entries(schema).map(([key, config]) =>
      `<a class="nav-link" href="#${encodeURIComponent(key)}" data-table="${key}"><span class="nav-icon">${config.icon}</span>${config.label}<span class="nav-count">${records[key].length}</span></a>`
    ).join("");

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
  document.querySelector("#add-record").hidden = isOverview;
  document.querySelector("#breadcrumb-current").textContent = isOverview ? "Overview" : schema[table].label;
  document.querySelector("#page-title").textContent = isOverview ? "Overview" : schema[table].label;
  document.querySelector("#page-subtitle").textContent = isOverview
    ? "A snapshot of your restaurant operations."
    : `Manage ${schema[table].label.toLowerCase()} and their related records.`;
  document.querySelector("#page-eyebrow").textContent = isOverview ? "PIZZAHAUS MANAGEMENT" : "DATA MANAGEMENT";
  nav.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", (link.dataset.table || null) === table));
  if (isOverview) renderOverview();
  else renderTable();
  window.location.hash = table || "overview";
}

function renderOverview() {
  const openIssues = records.QualityIssue.filter((row) => !/resolved|closed/i.test(row.ResolutionStatus || "")).length;
  const lowStock = records.Ingredient.filter((row) => Number(row.CurrentStock) <= Number(row.ReorderLevel)).length;
  const reportSales = records.DailyReport.reduce((sum, row) => sum + Number(row.TotalSales || 0), 0);
  const metrics = [
    ["Total orders", records.CustomerOrder.length, "Across all stores", "▣"],
    ["Menu items", records.MenuItem.length, "Available in the menu", "◉"],
    ["Low stock items", lowStock, lowStock ? "Need attention" : "Stock levels look good", "↕"],
    ["Reported sales", `$${reportSales.toFixed(2)}`, "From saved daily reports", "$"]
  ];
  const orders = [...records.CustomerOrder].sort((a, b) => String(b.OrderDateTime).localeCompare(String(a.OrderDateTime))).slice(0, 5);
  const issues = records.QualityIssue.filter((row) => !/resolved|closed/i.test(row.ResolutionStatus || "")).slice(0, 4);
  overviewPanel.innerHTML = `
    <div class="metrics-grid">${metrics.map(([label, value, hint, icon]) => `
      <article class="metric-card"><div class="metric-top">${label}<span class="metric-icon">${icon}</span></div>
      <div class="metric-value">${escapeHtml(value)}</div><div class="metric-hint">${hint}</div></article>`).join("")}</div>
    <div class="overview-grid">
      <section class="overview-card">
        <div class="card-heading"><h2>Recent orders</h2><a class="text-link" href="#CustomerOrder" data-jump="CustomerOrder">View all →</a></div>
        ${orders.length ? `<div class="table-wrap"><table class="overview-table"><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>STORE</th><th>METHOD</th><th>STATUS</th></tr></thead><tbody>
          ${orders.map((order) => `<tr><td>#${formatValue(order.OrderID)}</td><td><span class="order-name">${formatValue(order.CustomerName)}</span><span class="sub-cell">${formatValue(order.OrderDateTime)}</span></td><td>${formatValue(order.StoreID)}</td><td>${formatValue(order.PickupMethod)}</td><td><span class="status-pill pending">Received</span></td></tr>`).join("")}
        </tbody></table></div>` : `<div class="empty-state">No orders yet.</div>`}
      </section>
      <section class="overview-card">
        <div class="card-heading"><h2>Needs attention</h2><a class="text-link" href="#Ingredient" data-jump="Ingredient">Inventory →</a></div>
        <div class="stock-list">${records.Ingredient.filter((row) => Number(row.CurrentStock) <= Number(row.ReorderLevel)).map((item) =>
          `<div class="stock-row"><div><strong>${formatValue(item.IngredientName)}</strong><span>${formatValue(item.CurrentStock)} ${formatValue(item.UnitMeasure)} in stock · Reorder at ${formatValue(item.ReorderLevel)}</span></div><span class="stock-qty">LOW</span></div>`
        ).join("") || `<div class="empty-state">All ingredient levels are looking good.</div>`}
        </div>
        <div class="card-heading"><h2>Open quality issues</h2><a class="text-link" href="#QualityIssue" data-jump="QualityIssue">${openIssues} open</a></div>
        <div class="stock-list">${issues.map((issue) =>
          `<div class="stock-row"><div><strong>Order #${formatValue(issue.OrderID)}</strong><span>${formatValue(issue.Description)}</span></div><span class="stock-qty">${formatValue(issue.ResolutionStatus)}</span></div>`
        ).join("") || `<div class="empty-state">No open quality issues.</div>`}</div>
      </section>
    </div>`;
  overviewPanel.querySelectorAll("[data-jump]").forEach((link) => link.addEventListener("click", (event) => {
    event.preventDefault();
    navigate(link.dataset.jump);
  }));
}

function renderTable() {
  const config = schema[activeTable];
  const visibleFields = config.fields.filter(([key]) => key !== config.id);
  document.querySelector("#table-title").textContent = config.label;
  document.querySelector("#table-head").innerHTML = `<tr>${config.fields.map(([key]) => `<th>${escapeHtml(key)}</th>`).join("")}<th class="actions-cell">ACTIONS</th></tr>`;
  const filtered = records[activeTable].filter((record) =>
    Object.values(record).some((value) => String(value ?? "").toLowerCase().includes(searchTerm))
  );
  document.querySelector("#record-count").textContent = `${filtered.length} ${filtered.length === 1 ? "record" : "records"}`;
  document.querySelector("#table-summary").textContent = `${filtered.length} of ${records[activeTable].length} records`;
  document.querySelector("#table-body").innerHTML = filtered.length
    ? filtered.map((record) => `<tr>${config.fields.map(([key]) => `<td>${formatValue(record[key])}</td>`).join("")}
      <td class="actions-cell"><button class="row-action" type="button" data-edit="${escapeHtml(record[config.id])}">Edit</button><button class="row-action delete" type="button" data-delete="${escapeHtml(record[config.id])}">Delete</button></td></tr>`).join("")
    : `<tr><td colspan="${visibleFields.length + 2}" class="empty-state">No matching records found.</td></tr>`;

  document.querySelector("#table-body").querySelectorAll("[data-edit]").forEach((button) =>
    button.addEventListener("click", () => openDialog(button.dataset.edit))
  );
  document.querySelector("#table-body").querySelectorAll("[data-delete]").forEach((button) =>
    button.addEventListener("click", () => deleteRecord(button.dataset.delete))
  );
}

function openDialog(id) {
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
    const required = key === config.id || key.endsWith("Name") || key === "ItemName" || key === "Description";
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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!activeTable) return;
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

records = loadRecords();
renderNav();
const initialTable = decodeURIComponent(window.location.hash.slice(1));
navigate(Object.prototype.hasOwnProperty.call(schema, initialTable) ? initialTable : null);
