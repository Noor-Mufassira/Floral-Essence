document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("global-search");

  if (searchInput) {
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) {
          // Redirect to homepage or product page with query in URL
          window.location.href = `/home2-copy.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }

  // If on homepage, apply search
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search");

  if (searchQuery) {
    const products = document.querySelectorAll(".product-card");
    const inputField = document.getElementById("global-search");

    if (inputField) inputField.value = searchQuery;

    products.forEach((product) => {
      const title = product.querySelector(".card-title").textContent.toLowerCase();
      product.parentElement.style.display = title.includes(searchQuery.toLowerCase())
        ? "block"
        : "none";
    });
  }
});
