document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("subscribe-form");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailInput = document.getElementById("subscribe-email");
      const email = emailInput.value.trim();

      if (!email) {
        alert("⚠️ Please enter an email address.");
        return;
      }

      fetch("/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `email=${encodeURIComponent(email)}`
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          form.reset();
        })
        .catch(err => {
          console.error("❌ Subscription error:", err);
          alert("❌ Subscription failed. Please try again.");
        });
    });
  } else {
    console.warn("❗ Subscribe form not found.");
  }
});
