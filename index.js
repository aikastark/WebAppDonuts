const express = require("express");
const session = require("express-session");
const path = require("path");
const routes = require("./routes");
const dbConnection = require('./dbConnection.js'); 
const app = express();


// Set the views directory and view engine (for EJS templates)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware to parse URL-encoded and JSON data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware for session management
app.use(
    session({
        name: "session",
        secret: "your_secret_key", // Use a secure key
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 3600 * 1000, // 1 hour
        },
    })
);

app.get('/auth-status', (req, res) => {
    if (req.session && req.session.userID) {
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});


// Serve static files from the `public` directory
app.use(express.static(path.join(__dirname, "public")));

// Middleware for logging sessions (useful for debugging)
app.use((req, res, next) => {
    console.log("Session data:", req.session);
    next();
});
// Define routes for static HTML files with error handling
const sendStaticFile = (res, filePath, next) => {
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`File not found: ${filePath}`);
            next(err);
        }
    });
};

app.get("/", (req, res, next) => {
    const filePath = path.join(__dirname, "Main", "index.html");
    sendStaticFile(res, filePath, next);
});

app.get("/menu", (req, res, next) => {
    const filePath = path.join(__dirname, "Menu", "menu.html");
    sendStaticFile(res, filePath, next);
});

app.get("/cart", (req, res, next) => {
    const filePath = path.join(__dirname, "Cart", "cart.html");
    sendStaticFile(res, filePath, next);
});

app.get("/payment", (req, res, next) => {
    const filePath = path.join(__dirname, "payment", "payment.html");
    sendStaticFile(res, filePath, next);
});

// Use routes defined in `routes.js`
app.use(routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error occurred:", err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        status: err.status || 500,
    });
});


app.post('/api/currency', (req, res) => {
    const { currency } = req.body;

    if (!currency || !['usd', 'kzt'].includes(currency.toLowerCase())) {
        return res.status(400).json({ error: "Invalid currency" });
    }

    req.session.currency = currency.toLowerCase(); // Сохраняем валюту в сессии
    res.json({ success: true, currency: req.session.currency });
});

app.get('/api/currency', (req, res) => {
    const currency = req.session.currency || 'usd'; // USD по умолчанию
    res.json({ currency });
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
