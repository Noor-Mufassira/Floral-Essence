document.addEventListener("DOMContentLoaded", function () {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  const historyBtn = document.getElementById("history-btn");

  // Load cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function renderCart() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<tr><td colspan="6" class="text-center">Your cart is empty 🌸</td></tr>`;
      cartTotal.textContent = "$0.00";
      return;
    }

    cart.forEach((item, index) => {
      // Fallbacks for undefined properties
      const name = item.name || "Unnamed Product";
      const image = item.image || "placeholder.jpg";
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      const itemTotal = price * quantity;

      total += itemTotal;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img src="${image}" alt="${name}" class="cart-img-thumbnail" style="max-width: 60px;"/></td>
        <td>${name}</td>
        <td>$${price.toFixed(2)}</td>
        <td>
          <div class="quantity-control">
            <button class="btn btn-sm btn-outline-dark decrease" data-index="${index}">-</button>
            <span class="mx-2">${quantity}</span>
            <button class="btn btn-sm btn-outline-dark increase" data-index="${index}">+</button>
          </div>
        </td>
        <td>$${itemTotal.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-danger remove" data-index="${index}">Remove</button>
        </td>
      `;
      cartItemsContainer.appendChild(row);
    });

    cartTotal.textContent = `$${total.toFixed(2)}`;
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Quantity change & remove buttons
  cartItemsContainer.addEventListener("click", function (e) {
    const index = parseInt(e.target.dataset.index);
    if (isNaN(index)) return;

    if (e.target.classList.contains("increase")) {
      cart[index].quantity = (parseInt(cart[index].quantity) || 1) + 1;
    } else if (e.target.classList.contains("decrease")) {
      cart[index].quantity = (parseInt(cart[index].quantity) || 1) - 1;
      if (cart[index].quantity < 1) {
        cart.splice(index, 1);
      }
    } else if (e.target.classList.contains("remove")) {
      cart.splice(index, 1);
    }

    renderCart();
  });

  // Checkout button
  checkoutBtn?.addEventListener("click", function () {
    const isLoggedIn = sessionStorage.getItem("loggedInUser");
    if (!isLoggedIn) {
      window.location.href = "index.html?next=checkout-form";
    } else {
      window.location.href = "checkout.html";
    }
  });

  // History button
  historyBtn?.addEventListener("click", function () {
    const isLoggedIn = sessionStorage.getItem("loggedInUser");
    if (!isLoggedIn) {
      window.location.href = "index.html?next=order-form";
    } else {
      window.location.href = "order-history.html";
    }
  });

  // Initial render
  renderCart();
});
