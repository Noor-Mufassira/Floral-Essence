document.addEventListener("DOMContentLoaded", () => {
  const formSelectors = ["form.subscribe-form", "form.newsletter-form"]; // Support multiple styles if needed

  formSelectors.forEach((selector) => {
    const form = document.querySelector(selector);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput = form.querySelector("input[type='email']");
      const messageBox = form.querySelector(".subscribe-message");
      const email = emailInput?.value.trim();

      if (!email) {
        showMessage("❌ Please enter a valid email.", "red");
        return;
      }

      try {
        const res = await fetch("/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        showMessage(data.message, data.message.includes("✅") ? "green" : "orange");
        if (data.message.includes("✅")) emailInput.value = "";
      } catch (err) {
        showMessage("❌ Network error. Try again later.", "red");
      }

      function showMessage(text, color) {
        if (!messageBox) {
          const msg = document.createElement("small");
          msg.className = "subscribe-message mt-2 d-block";
          msg.style.color = color;
          msg.innerText = text;
          form.appendChild(msg);
        } else {
          messageBox.innerText = text;
          messageBox.style.color = color;
        }
      }
    });
  });
});
