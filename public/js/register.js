document.addEventListener("DOMContentLoaded", () => {
  const userForm = document.getElementById("user-register-form");

  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("userUsername").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    const password = document.getElementById("userPassword").value;
    const confirmPassword = document.getElementById("userConfirmPassword").value;

    if (password !== confirmPassword) {
      alert("❌ Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();
      alert(result.message);

      if (response.ok && result.message.startsWith("✅")) {
        // ✅ Redirect to index.html after success
        window.location.href = "index.html";
      }
    } catch (err) {
      console.error("❌ Registration Error:", err);
      alert("❌ Registration failed. Please try again later.");
    }
  });
});
