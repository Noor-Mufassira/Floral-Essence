document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
  loadMessages();
  loadSubscribers();
});

function logout() {
  window.location.href = "login.html";
}

async function loadOrders() {
  const res = await fetch("/admin/orders");
  const data = await res.json();
  const tbody = document.querySelector("#orders-table tbody");
  tbody.innerHTML = "";
  data.forEach(order => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${order.username}</td>
      <td>${order.email}</td>
      <td>${order.phone}</td>
      <td>${order.address}</td>
      <td>${order.items}</td>
      <td>${order.status}</td>
      <td>
        <select onchange="updateOrderStatus('${order.id}', this.value)">
          <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Approved" ${order.status === "Approved" ? "selected" : ""}>Approved</option>
          <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
          <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
        </select>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function updateOrderStatus(id, status) {
  await fetch("/admin/update-order-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  loadOrders(); // Refresh
}

async function loadMessages() {
  const res = await fetch("/admin/messages");
  const data = await res.json();
  const tbody = document.querySelector("#messages-table tbody");
  tbody.innerHTML = "";
  data.forEach(msg => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${msg.name}</td>
      <td>${msg.email}</td>
      <td>${msg.subject}</td>
      <td>${msg.your_message}</td>
    `;
    tbody.appendChild(row);
  });
}

async function loadSubscribers() {
  const res = await fetch("/admin/subscribers");
  const data = await res.json();
  const tbody = document.querySelector("#subscribers-table tbody");
  tbody.innerHTML = "";
  data.forEach(sub => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${sub.email}</td>
      <td><button onclick="unsubscribe('${sub.email}')">Remove</button></td>
    `;
    tbody.appendChild(row);
  });
}

async function unsubscribe(email) {
  await fetch("/admin/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  loadSubscribers();
}
