const orderList = document.querySelector("#clerk-order-list");
const historyList = document.querySelector("#clerk-history-list");
const clerkOverview = document.querySelector("#clerk-overview");
const clerkOrderCount = document.querySelector("#clerk-order-count");
const clerkNotice = document.querySelector("#staff-notice");
const historyDialog = document.querySelector("#history-order-dialog");
const historyDialogTitle = document.querySelector("#history-dialog-title");
const historyDialogContent = document.querySelector("#history-dialog-content");
const allowedStatuses = ["Received", "Preparing", "Ready", "Completed", "Delivered", "Cancelled"];
const clerkData = window.PizzaHausData;
const historyStatuses = new Set(["Completed", "Delivered", "Cancelled"]);

function escapeOrderText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function showClerkNotice(message, isError) {
  clerkNotice.textContent = message;
  clerkNotice.classList.toggle("error", Boolean(isError));
  clerkNotice.hidden = false;
}

function renderOverview(orders) {
  const historyCount = orders.filter((order) => historyStatuses.has(orderStatus(order))).length;
  const inProgress = orders.length - historyCount;
  const summary = [
    ["All orders", orders.length, "Orders saved in this browser", "▣"],
    ["Current orders", inProgress, "New and in-progress orders", "◷"],
    ["Order history", historyCount, "Completed, delivered, or cancelled", "✓"]
  ];

  clerkOverview.innerHTML = summary.map(([label, value, hint, icon]) => `
    <article class="clerk-summary-card">
      <div><span class="clerk-summary-label">${label}</span><strong>${value}</strong><span class="clerk-summary-hint">${hint}</span></div>
      <span class="clerk-summary-icon" aria-hidden="true">${icon}</span>
    </article>`).join("");
}

function orderStatus(order) {
  return allowedStatuses.includes(order.Status) ? order.Status : "Received";
}

function fitCurrentOrders() {
  const cards = orderList.querySelectorAll(".clerk-control-card");
  orderList.style.maxHeight = cards.length > 1
    ? `${cards[0].getBoundingClientRect().height}px`
    : "";
}

function renderOrders() {
  try {
    const orders = clerkData.getOrders().slice().sort((a, b) =>
      String(b.OrderDateTime || "").localeCompare(String(a.OrderDateTime || ""))
    );
    const currentOrders = orders.filter((order) => !historyStatuses.has(orderStatus(order)));
    const historyOrders = orders.filter((order) => historyStatuses.has(orderStatus(order)));
    renderOverview(orders);
    clerkOrderCount.textContent = `${historyOrders.length} ${historyOrders.length === 1 ? "record" : "records"}`;
    if (!currentOrders.length) {
      orderList.innerHTML = '<div class="empty-state clerk-empty-state">No orders to manage.</div>';
    } else {
      orderList.innerHTML = currentOrders.map((order) => {
        const currentStatus = orderStatus(order);
        const items = (order.OrderItems || []).map((item) =>
          `<li>${escapeOrderText(item.Quantity)} × ${escapeOrderText(item.ItemName)}</li>`
        ).join("");
        return `
          <article class="clerk-control-card">
            <div class="clerk-control-heading">
              <div>
                <p class="eyebrow">${escapeOrderText(order.Reference || `Order ${order.OrderID}`)}</p>
                <h3>${escapeOrderText(order.CustomerName || "Guest customer")}</h3>
              </div>
              <span class="status-chip warning">${escapeOrderText(currentStatus)}</span>
            </div>
            <div class="clerk-control-details">
              <p><strong>Branch:</strong> ${escapeOrderText(order.StoreName || "—")}</p>
              <p><strong>Fulfillment:</strong> ${escapeOrderText(order.PickupMethod || "—")}</p>
              <p><strong>Placed:</strong> ${escapeOrderText(order.OrderDateTime || "—")}</p>
              <p><strong>Contact:</strong> ${escapeOrderText(order.ContactNumber || "—")}</p>
            </div>
            <ul class="clerk-control-items">${items || "<li>Item details unavailable</li>"}</ul>
            <div class="clerk-control-footer">
              <strong class="clerk-control-total">Total: P${Number(order.Total || 0).toFixed(2)}</strong>
              <div class="clerk-status-form">
                <label for="status-${escapeOrderText(order.OrderID)}">Update status</label>
                <select id="status-${escapeOrderText(order.OrderID)}" data-order-status="${escapeOrderText(order.OrderID)}">
                  ${allowedStatuses.map((status) => `<option value="${status}" ${status === currentStatus ? "selected" : ""}>${status}</option>`).join("")}
                </select>
                <button class="primary-button" type="button" data-save-status="${escapeOrderText(order.OrderID)}">Save status</button>
              </div>
            </div>
          </article>`;
      }).join("");
      fitCurrentOrders();
    }

    if (!historyOrders.length) {
      historyList.innerHTML = '<div class="empty-state clerk-history-empty">Completed, delivered, or cancelled orders will appear here.</div>';
    } else {
      historyList.innerHTML = historyOrders.map((order) => {
        const currentStatus = orderStatus(order);
        const statusClass = currentStatus === "Cancelled" ? "danger" : "success";
        return `
          <article class="clerk-history-record">
            <button class="clerk-history-select" type="button" data-history-order="${escapeOrderText(order.OrderID)}">
              <span class="clerk-history-record-heading">
                <span><strong>${escapeOrderText(order.Reference || `Order ${order.OrderID}`)}</strong><span>${escapeOrderText(order.CustomerName || "Guest customer")}</span></span>
                <span class="status-chip ${statusClass}">${escapeOrderText(currentStatus)}</span>
              </span>
              <span class="clerk-history-record-summary">
                <span>${escapeOrderText(order.OrderDateTime || "—")}</span>
                <strong>P${Number(order.Total || 0).toFixed(2)}</strong>
              </span>
              <span class="clerk-history-action">View order details →</span>
            </button>
          </article>`;
      }).join("");
    }
  } catch (error) {
    showClerkNotice(error.message, true);
  }
}

function showHistoryOrder(order) {
  const status = orderStatus(order);
  const statusClass = status === "Cancelled" ? "danger" : "success";
  const items = (order.OrderItems || []).map((item) =>
    `<li>${escapeOrderText(item.Quantity)} × ${escapeOrderText(item.ItemName)}</li>`
  ).join("");
  historyDialogTitle.textContent = order.Reference || `Order ${order.OrderID}`;
  historyDialogContent.innerHTML = `
    <div class="history-dialog-heading">
      <strong>${escapeOrderText(order.CustomerName || "Guest customer")}</strong>
      <span class="status-chip ${statusClass}">${escapeOrderText(status)}</span>
    </div>
    <div class="history-dialog-details">
      <p><strong>Branch:</strong> ${escapeOrderText(order.StoreName || "—")}</p>
      <p><strong>Fulfillment:</strong> ${escapeOrderText(order.PickupMethod || "—")}</p>
      <p><strong>Contact:</strong> ${escapeOrderText(order.ContactNumber || "—")}</p>
      <p><strong>Placed:</strong> ${escapeOrderText(order.OrderDateTime || "—")}</p>
      <p><strong>Payment:</strong> ${escapeOrderText(order.PaymentMethod || "—")} · ${escapeOrderText(order.PaymentStatus || "Demo only")}</p>
      ${order.DeliveryLocation ? `<p><strong>Delivery to:</strong> ${escapeOrderText(order.DeliveryLocation)}</p>` : ""}
    </div>
    <h3 class="history-dialog-items-title">Items</h3>
    <ul class="history-dialog-items">${items || "<li>Item details unavailable</li>"}</ul>
    <strong class="history-dialog-total">Total: P${Number(order.Total || 0).toFixed(2)}</strong>`;
  historyDialog.showModal();
}

orderList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-save-status]");
  if (!button) return;

  const orderID = button.dataset.saveStatus;
  const statusField = document.getElementById(`status-${orderID}`);
  if (!statusField || !allowedStatuses.includes(statusField.value)) {
    showClerkNotice("Choose a valid order status before saving.", true);
    return;
  }

  try {
    const orders = clerkData.getOrders();
    const order = orders.find((item) => String(item.OrderID) === orderID);
    if (!order) {
      showClerkNotice("That order no longer exists. Refresh the order desk and try again.", true);
      renderOrders();
      return;
    }
    order.Status = statusField.value;
    clerkData.saveOrders(orders);
    showClerkNotice(`Order ${order.Reference || orderID} updated to ${order.Status}.`, false);
    renderOrders();
  } catch (error) {
    showClerkNotice(error.message, true);
  }
});

historyList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-history-order]");
  if (!button) return;

  try {
    const orderID = button.dataset.historyOrder;
    const order = clerkData.getOrders().find((item) => String(item.OrderID) === orderID);
    if (!order || !historyStatuses.has(orderStatus(order))) {
      showClerkNotice("That order is no longer in history. Refresh the order desk and try again.", true);
      renderOrders();
      return;
    }
    showHistoryOrder(order);
  } catch (error) {
    showClerkNotice(error.message, true);
  }
});

document.querySelector("#close-history-dialog").addEventListener("click", () => historyDialog.close());
document.querySelector("#dismiss-history-dialog").addEventListener("click", () => historyDialog.close());
historyDialog.addEventListener("click", (event) => {
  if (event.target === historyDialog) historyDialog.close();
});

document.querySelector("#refresh-orders").addEventListener("click", renderOrders);
window.addEventListener("storage", (event) => {
  if (event.key === clerkData.orderStorageKey) renderOrders();
});
window.addEventListener("resize", fitCurrentOrders);

renderOrders();
