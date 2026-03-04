const router = require("express").Router();
const path = require("path");
const { body } = require("express-validator"); // Import body from express-validator
const dbConnection = require('./dbConnection.js');
const {getLimitedOrderHistory } = require('./controllers/userController');
const { saveReview } = require("./controllers/userController");

const {
    saveOrderDataToDB,
    getOrderHistory,
    profilePage,
    homePage,
    register,
    registerPage,
    login,
    loginPage,
} = require("./controllers/userController");
router.post('/register', register);
router.post("/api/reviews", saveReview);


// Middleware to check if the user is logged in
const ifNotLoggedin = (req, res, next) => {
    if (!req.session.userID) {
        return res.redirect("/login"); // Redirect to login page if not logged in
    }
    next();
};

// Middleware to check if the user is already logged in
const ifLoggedin = (req, res, next) => {
    if (req.session.userID) {
        return res.redirect("/profile"); // Redirect to profile if already logged in
    }
    next();
};

// Routes
router.get('/api/orders/limited', getLimitedOrderHistory);
router.get('/profile', ifNotLoggedin, profilePage); 
router.get('/order-history', ifNotLoggedin, getOrderHistory);
router.post('/save-order', ifNotLoggedin, saveOrderDataToDB);
router.get("/", homePage);
router.get("/login", ifLoggedin, loginPage);
router.post(
    "/login",
    ifLoggedin,
    [
        body("_phonenumber", "Invalid phone number format")
            .notEmpty()
            .trim()
            .matches(/^\+?\d{10,15}$/),
        body("_password", "The Password must be at least 4 characters long")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    login
);

router.get("/signup", ifLoggedin, registerPage);
router.post(
    "/signup",
    ifLoggedin,
    [
        body("_name", "The name must be at least 3 characters long")
            .notEmpty()
            .escape()
            .trim()
            .isLength({ min: 3 }),
        body("_phonenumber", "Invalid phone number format")
            .notEmpty()
            .trim()
            .matches(/^\+?\d{10,15}$/),
        body("_password", "The Password must be at least 4 characters long")
            .notEmpty()
            .trim()
            .isLength({ min: 4 }),
    ],
    register
);


// Route for profile page
router.get("/profile", ifNotLoggedin, async (req, res) => {
    const userID = req.session.userID;

    try {
        // Fetch user details from the database
        const [user] = await dbConnection.execute(
            "SELECT name, phonenumber FROM users WHERE id = ?",
            [userID]
        );

        if (user.length > 0) {
            // Fetch total number of orders for this user
            const [orders] = await dbConnection.execute(
                "SELECT COUNT(*) AS totalOrders FROM orders WHERE user_id = ?",
                [userID]
            );

            const totalOrders = orders[0]?.totalOrders || 0;

            // Render the profile page with user details and totalOrders
            res.render("profile", { 
                user: user[0],
                totalOrders   
            });
        } else {
            res.redirect("/login"); // Redirect if user not found
        }
    } catch (error) {
        console.error("Error fetching user details:", error.message);
        res.status(500).send("An error occurred while fetching user details.");
    }
});




// Check Authentication Status
router.get("/auth-status", (req, res) => {
    if (req.session.userID) {
        return res.json({ isLoggedIn: true });
    }
    res.json({ isLoggedIn: false });
});

// Static pages
router.get("/menu.html", (req, res) => {
    res.sendFile(path.join(__dirname, "Menu", "menu.html"));
});

router.get("/cart.html", (req, res) => {
    res.sendFile(path.join(__dirname, "Cart", "cart.html"));
});

router.get("/payment.html", (req, res) => {
    res.sendFile(path.join(__dirname, "payment", "payment.html"));
});

// Protect menu page
router.get("/menu", (req, res) => {
    if (!req.session.userID) {
        return res.redirect("/login"); // Redirect to login if not logged in
    }
    res.sendFile(path.join(__dirname, "Menu", "menu.html"));
});



// POST route to save order
router.post(
    "/save-order",
    [
        body("paymentMethod").notEmpty().withMessage("Payment method is required"),
        body("totalAmount").isNumeric().withMessage("Total amount is required"),
        body("type").notEmpty().withMessage("Type must be either 'Delivery' or 'Pickup'"),
        body("store").optional().isString().withMessage("Store must be a valid string"),
    ],
    saveOrderDataToDB
);

// Route to fetch all orders
router.get('/api/orders', getOrderHistory);

// Route to fetch limited orders (e.g., last 3)
router.get('/api/orders/limited', getLimitedOrderHistory);

router.get('/api/total-orders', async (req, res) => {
    const userID = req.session.userID;

    if (!userID) {
        return res.status(401).json({ error: "User not logged in" });
    }

    try {
        const [result] = await dbConnection.execute(
            "SELECT COUNT(*) AS totalOrders FROM orders WHERE user_id = ?",
            [userID]
        );
        res.json({ totalOrders: result[0].totalOrders || 0 });
    } catch (error) {
        console.error("Error fetching total orders:", error.message);
        res.status(500).json({ error: "An error occurred while fetching total orders." });
    }
});


// Logout route
router.get("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.redirect("/login");
    });
});

module.exports = router;
