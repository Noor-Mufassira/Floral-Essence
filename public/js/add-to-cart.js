// add-to-cart.js

document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartCount();

  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      const card = this.closest(".card");
      const name = card.querySelector(".card-title")?.innerText || "Unnamed Product";
      const price = parseFloat(
        card.querySelector(".price")?.innerText.replace("$", "") || "0"
      );
      const image = card.querySelector("img")?.src || "";

      const product = {
        name,
        price,
        image,
        quantity: 1,
      };

      const existing = cart.find((item) => item.name === product.name);
      if (existing) {
        existing.quantity++;
      } else {
        cart.push(product);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
      alert(`${name} added to cart!`);
    });
  });
});

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountEl = document.querySelector(".cart-count");
  if (cartCountEl) cartCountEl.innerText = count;
}
