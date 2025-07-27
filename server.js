// Updated server.js WITH Order History and Corrected Order Format
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const cors = require("cors");
const app = express();
const PORT = 3000;
app.use(cors());

// Create 'data' folder if it doesn't exist
const dbDir = path.join(__dirname, "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Connect to SQLite
const dbPath = path.join(dbDir, "freshly.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error("❌ Database connection error:", err.message);
  console.log("✅ Connected to SQLite database");
});

// Create required tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      name TEXT,
      email TEXT,
      subject TEXT,
      your_message TEXT,
      submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS subscribers (
      email TEXT UNIQUE,
      subscribed_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT UNIQUE,
      password TEXT,
      email TEXT UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shopping_list (
      username TEXT,
      item_name TEXT,
      quantity INTEGER,
      total_price REAL,
      added_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      username TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      items TEXT,
      status TEXT DEFAULT 'Pending',
      ordered_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Contact form
app.post("/submit-application", (req, res) => {
  const { name, email, subject, your_message } = req.body;
  const q = `INSERT INTO applications (name, email, subject, your_message) VALUES (?, ?, ?, ?)`;
  db.run(q, [name, email, subject, your_message], function (err) {
    if (err) return res.status(500).json({ message: "❌ Submission failed." });
    res.json({ message: "✅ Application submitted successfully!" });
  });
});

// Newsletter
app.post("/subscribe", (req, res) => {
  const email = req.body.email?.trim();
  if (!email) return res.status(400).json({ message: "❌ Email is required." });

  db.get(`SELECT email FROM subscribers WHERE email = ?`, [email], (err, row) => {
    if (err) return res.status(500).json({ message: "❌ Error checking subscription." });
    if (row) return res.json({ message: "⚠️ Already subscribed!" });

    db.run(`INSERT INTO subscribers (email) VALUES (?)`, [email], function (err) {
      if (err) return res.status(500).json({ message: "❌ Could not subscribe." });
      res.json({ message: "✅ Subscription successful!" });
    });
  });
});

// User Registration
app.post("/register-user", (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return res.status(400).json({ message: "❌ All fields are required." });

  const q = `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`;
  db.run(q, [username.trim(), password.trim(), email.trim()], function (err) {
    if (err) {
      console.error("❌ Register User Error:", err.message);
      return res.status(400).json({ message: "❌ Username or Email already exists." });
    }
    res.json({ message: "✅ User registered successfully!" });
  });
});

// User Login
app.post("/login-user", (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username.trim()], (err, row) => {
    if (err || !row) return res.status(401).json({ message: "❌ Invalid user credentials." });

    if (row.password.trim() !== password.trim()) {
      return res.status(401).json({ message: "❌ Invalid password." });
    }

    req.session.user = { username: row.username, role: "user" };
    res.json({
      message: "✅ User login successful!",
      redirect: "HOME2-Copy.html",
      username: row.username
    });
  });
});

// ✅ Hardcoded Admin Login (NO registration anymore)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "1234";
const ADMIN_EMPLOYEE_ID = "5678";

app.post("/login-admin", (req, res) => {
  const { username, password, employeeId } = req.body;

  if (
    username.trim() === ADMIN_USERNAME &&
    password.trim() === ADMIN_PASSWORD &&
    employeeId.trim() === ADMIN_EMPLOYEE_ID
  ) {
    req.session.user = { username: ADMIN_USERNAME, role: "admin" };
    return res.json({
      message: "✅ Admin login successful!",
      redirect: "admin-dashboard.html",
      username: ADMIN_USERNAME,
    });
  } else {
    return res.status(401).json({ message: "❌ Invalid admin credentials." });
  }
});

// View all orders
app.get("/admin/orders", (req, res) => {
  db.all(`SELECT rowid AS id, * FROM orders ORDER BY ordered_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "❌ Failed to fetch orders" });
    res.json(rows);
  });
});

// Update order status
app.post("/admin/update-order-status", (req, res) => {
  const { id, status } = req.body;
  db.run(`UPDATE orders SET status = ? WHERE rowid = ?`, [status, id], function(err) {
    if (err) return res.status(500).json({ message: "❌ Failed to update status" });
    res.json({ message: "✅ Status updated" });
  });
});

// View contact messages
app.get("/admin/messages", (req, res) => {
  db.all(`SELECT * FROM applications ORDER BY submitted_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "❌ Failed to fetch messages" });
    res.json(rows);
  });
});

// View subscribers
app.get("/admin/subscribers", (req, res) => {
  db.all(`SELECT * FROM subscribers ORDER BY subscribed_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "❌ Failed to fetch subscribers" });
    res.json(rows);
  });
});

// Unsubscribe (delete subscriber)
app.post("/admin/unsubscribe", (req, res) => {
  const { email } = req.body;
  db.run(`DELETE FROM subscribers WHERE email = ?`, [email], function(err) {
    if (err) return res.status(500).json({ message: "❌ Failed to unsubscribe" });
    res.json({ message: "✅ Unsubscribed" });
  });
});

// Handle checkout and save to orders table
app.post("/checkout", (req, res) => {
  const { username, email, phone, address, items } = req.body;

  if (!username || !email || !phone || !address || !items) {
    return res.status(400).json({ message: "❌ Missing fields in order." });
  }

  const itemsString = JSON.stringify(items);

  const query = `
    INSERT INTO orders (username, email, phone, address, items)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [username, email, phone, address, itemsString], function (err) {
    if (err) {
      console.error("❌ Failed to insert order:", err.message);
      return res.status(500).json({ message: "❌ Failed to place order." });
    }

    res.json({ message: "✅ Order placed successfully!" });
  });
});

app.get("/order-history", (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ message: "❌ Username missing in request." });
  }

  const query = `SELECT username, ordered_at, items, status FROM orders WHERE username = ? ORDER BY ordered_at DESC`;
  db.all(query, [username], (err, rows) => {
    if (err) {
      console.error("❌ Failed to fetch order history:", err.message);
      return res.status(500).json({ message: "❌ Failed to load order history." });
    }

    // Ensure items are valid JSON (for frontend parsing)
    const formattedOrders = rows.map(order => {
      let parsedItems;
      try {
        parsedItems = JSON.parse(order.items);
      } catch (e) {
        parsedItems = [];
      }

      return {
        username: order.username,
        ordered_at: order.ordered_at,
        items: parsedItems,
        status: order.status
      };
    });

    res.json(formattedOrders);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});