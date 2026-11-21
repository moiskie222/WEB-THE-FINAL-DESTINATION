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

function cloneTemplate(id) {
  const template = document.getElementById(id);
  if (!template || !template.content.firstElementChild) {
    throw new Error(`The "${id}" HTML template is missing.`);
  }
  return template.content.firstElementChild.cloneNode(true);
}

function showEmptyState(container, message, className) {
  const emptyState = cloneTemplate("clerk-empty-state-template");
  emptyState.classList.add(className);
  emptyState.textContent = message;
  container.replaceChildren(emptyState);
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

  clerkOverview.replaceChildren(...summary.map(([label, value, hint, icon]) => {
    const card = cloneTemplate("clerk-summary-card-template");
    card.querySelector("[data-summary-label]").textContent = label;
    card.querySelector("[data-summary-value]").textContent = value;
    card.querySelector("[data-summary-hint]").textContent = hint;
    card.querySelector("[data-summary-icon]").textContent = icon;
    return card;
  }));
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
      orderList.style.maxHeight = "";
      showEmptyState(orderList, "No orders to manage.", "clerk-empty-state");
    } else {
      orderList.replaceChildren(...currentOrders.map((order) => {
        const currentStatus = orderStatus(order);
        const card = cloneTemplate("clerk-current-order-template");
        const orderID = String(order.OrderID);
        card.querySelector("[data-order-reference]").textContent = order.Reference || `Order ${orderID}`;
        card.querySelector("[data-customer-name]").textContent = order.CustomerName || "Guest customer";
        card.querySelector("[data-order-status-label]").textContent = currentStatus;
        card.querySelector("[data-order-branch]").textContent = order.StoreName || "—";
        card.querySelector("[data-order-fulfillment]").textContent = order.PickupMethod || "—";
        card.querySelector("[data-order-date]").textContent = order.OrderDateTime || "—";
        card.querySelector("[data-order-contact]").textContent = order.ContactNumber || "—";
        card.querySelector("[data-order-total]").textContent = `Total: P${Number(order.Total || 0).toFixed(2)}`;

        const statusSelect = card.querySelector("[data-order-status]");
        const statusLabel = card.querySelector("[data-order-status-label-for]");
        statusSelect.id = `status-${orderID}`;
        statusSelect.dataset.orderStatus = orderID;
        statusLabel.htmlFor = statusSelect.id;
        statusLabel.textContent = "Update status";
        allowedStatuses.forEach((status) => {
          const option = cloneTemplate("clerk-status-option-template");
          option.value = status;
          option.textContent = status;
          option.selected = status === currentStatus;
          statusSelect.append(option);
        });
        card.querySelector("[data-save-status]").dataset.saveStatus = orderID;

        const itemList = card.querySelector("[data-order-items]");
        const items = Array.isArray(order.OrderItems) ? order.OrderItems : [];
        if (items.length) {
          items.forEach((item) => {
            const itemRow = cloneTemplate("clerk-order-item-template");
            itemRow.textContent = `${item.Quantity ?? "—"} × ${item.ItemName || "—"}`;
            itemList.append(itemRow);
          });
        } else {
          const itemRow = cloneTemplate("clerk-order-item-template");
          itemRow.textContent = "Item details unavailable";
          itemList.append(itemRow);
        }
        return card;
      }));
      fitCurrentOrders();
    }

    if (!historyOrders.length) {
      showEmptyState(historyList, "Completed, delivered, or cancelled orders will appear here.", "clerk-history-empty");
    } else {
      historyList.replaceChildren(...historyOrders.map((order) => {
        const currentStatus = orderStatus(order);
        const statusClass = currentStatus === "Cancelled" ? "danger" : "success";
        const card = cloneTemplate("clerk-history-order-template");
        const button = card.querySelector("[data-history-order]");
        button.dataset.historyOrder = order.OrderID;
        card.querySelector("[data-history-reference]").textContent = order.Reference || `Order ${order.OrderID}`;
        card.querySelector("[data-history-customer]").textContent = order.CustomerName || "Guest customer";
        const statusChip = card.querySelector("[data-history-status]");
        statusChip.classList.add(statusClass);
        statusChip.textContent = currentStatus;
        card.querySelector("[data-history-date]").textContent = order.OrderDateTime || "—";
        card.querySelector("[data-history-total]").textContent = `P${Number(order.Total || 0).toFixed(2)}`;
        return card;
      }));
    }
  } catch (error) {
    showClerkNotice(error.message, true);
  }
}

function showHistoryOrder(order) {
  const status = orderStatus(order);
  const statusClass = status === "Cancelled" ? "danger" : "success";
  historyDialogTitle.textContent = order.Reference || `Order ${order.OrderID}`;
  const details = cloneTemplate("clerk-history-details-template");
  details.querySelector("[data-detail-customer]").textContent = order.CustomerName || "Guest customer";
  const statusChip = details.querySelector("[data-detail-status]");
  statusChip.classList.add(statusClass);
  statusChip.textContent = status;
  details.querySelector("[data-detail-branch]").textContent = order.StoreName || "—";
  details.querySelector("[data-detail-fulfillment]").textContent = order.PickupMethod || "—";
  details.querySelector("[data-detail-contact]").textContent = order.ContactNumber || "—";
  details.querySelector("[data-detail-date]").textContent = order.OrderDateTime || "—";
  details.querySelector("[data-detail-payment]").textContent =
    `${order.PaymentMethod || "—"} · ${order.PaymentStatus || "Demo only"}`;
  if (order.DeliveryLocation) {
    details.querySelector("[data-delivery-row]").hidden = false;
    details.querySelector("[data-detail-delivery]").textContent = order.DeliveryLocation;
  }
  const itemList = details.querySelector("[data-detail-items]");
  const items = Array.isArray(order.OrderItems) ? order.OrderItems : [];
  if (items.length) {
    items.forEach((item) => {
      const itemRow = cloneTemplate("clerk-order-item-template");
      itemRow.textContent = `${item.Quantity ?? "—"} × ${item.ItemName || "—"}`;
      itemList.append(itemRow);
    });
  } else {
    const itemRow = cloneTemplate("clerk-order-item-template");
    itemRow.textContent = "Item details unavailable";
    itemList.append(itemRow);
  }
  details.querySelector("[data-detail-total]").textContent = `Total: P${Number(order.Total || 0).toFixed(2)}`;
  historyDialogContent.replaceChildren(details);
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
