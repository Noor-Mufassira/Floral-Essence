document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const userBtn = document.getElementById("userBtn");
  const adminBtn = document.getElementById("adminBtn");
  const loginType = document.getElementById("login-type");
  const employeeField = document.querySelector(".admin-field");

  let role = "user"; // default role

  // Toggle to User
  userBtn.addEventListener("click", () => {
    role = "user";
    loginType.innerText = "User";
    employeeField.classList.add("d-none");
    userBtn.classList.add("active");
    adminBtn.classList.remove("active");
  });

  // Toggle to Admin
  adminBtn.addEventListener("click", () => {
    role = "admin";
    loginType.innerText = "Admin";
    employeeField.classList.remove("d-none");
    adminBtn.classList.add("active");
    userBtn.classList.remove("active");
  });

  // Handle form submit
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const employeeId = document.getElementById("employeeId").value.trim();

    if (!username || !password || (role === "admin" && !employeeId)) {
      alert("⚠️ Please fill all required fields.");
      return;
    }

    const endpoint = role === "admin" ? "/login-admin" : "/login-user";

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    if (role === "admin") {
      formData.append("employeeId", employeeId);
    }

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString()
    })
    .then(res => res.json())
    .then(data => {
      if (data.redirect) {
        // ✅ Store logged-in username for future use
        sessionStorage.setItem("loggedInUser", username);

        // Check for redirect intent (e.g., from checkout page)
        const urlParams = new URLSearchParams(window.location.search);
        const next = urlParams.get("next");

        if (next === "checkout-form") {
          window.location.href = "cart.html#checkout-form";
        } else if (next === "order-form") {
          window.location.href = "cart.html#order-form";
        } else {
          window.location.href = data.redirect; // go to home or admin dashboard
        }
      } else {
        alert(data.message || "❌ Invalid credentials.");
      }
    })
    .catch(err => {
      console.error("❌ Login error:", err);
      alert("❌ Login failed. Please try again later.");
    });
  });
});
