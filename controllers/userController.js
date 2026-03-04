const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const dbConnection = require("../dbConnection.js");

console.log('getUserOrders loaded'); 

// Home Page
exports.homePage = async (req, res, next) => {
    let user = null;

    if (req.session.userID) {
        const [row] = await dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [req.session.userID]);

        if (row.length === 1) {
            user = row[0]; // Pass user data if logged in
        }
    }

    res.render('home', {
        user // Pass user data to the view
    });
};


// Register Page
exports.registerPage = (req, res, next) => {
    res.render("register");
};

// User Registration
exports.register = async (req, res, next) => {
    const errors = validationResult(req);
    const { _name, _phonenumber, _password } = req.body;

    if (!errors.isEmpty()) {
        return res.render('register', {
            error: errors.array()[0].msg,
        });
    }

    try {
        // Check if the phone number is already in use
        const [existingUser] = await dbConnection.execute(
            "SELECT * FROM `users` WHERE `phonenumber` = ?",
            [_phonenumber]
        );

        if (existingUser.length > 0) {
            return res.render('register', {
                error: 'This phone number is already in use.',
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(_password, 12);

        // Insert the new user into the database
        const [result] = await dbConnection.execute(
            "INSERT INTO `users` (`name`, `phonenumber`, `password`) VALUES (?, ?, ?)",
            [_name, _phonenumber, hashedPassword]
        );

        // Retrieve the inserted user ID
        const userId = result.insertId;

        // Store the user ID in the session
        req.session.userID = userId;

        // Redirect to profile page
        res.redirect('/profile');
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).send('An error occurred during registration.');
    }
};



// Login Page
exports.loginPage = (req, res, next) => {
    res.render("login");
};

// Login User
exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('login', {
            error: errors.array()[0].msg
        });
    }

    try {
        const [row] = await dbConnection.execute(
            'SELECT * FROM `users` WHERE `phonenumber`=?',
            [body._phonenumber]
        );

        if (row.length != 1) {
            return res.render('login', {
                error: 'Invalid phone number.'
            });
        }

        const checkPass = await bcrypt.compare(body._password, row[0].password);

        if (checkPass === true) {
            req.session.userID = row[0].id;
            return res.redirect('/');
        }

        res.render('login', {
            error: 'Invalid password.'
        });

    } catch (e) {
        next(e);
    }
};

exports.saveOrderDataToDB = async (req, res, next) => {
    const { paymentMethod, type, address, time, store, totalAmount } = req.body;
    const userID = req.session.userID;

    console.log("Received data:", { paymentMethod, type, address, time, store, totalAmount, userID });

    if (!userID) {
        return res.status(400).json({ error: "User not logged in" });
    }

    if (!paymentMethod || !type || !totalAmount || (!address && !store)) {
        return res.status(400).json({ error: "Required fields are missing" });
    }

    try {
        // Save order to `orders` table
        const [orderResult] = await dbConnection.execute(
            "INSERT INTO `orders`(`user_id`, `total_amount`, `payment_method`, `order_date`, `status`) VALUES (?, ?, ?, NOW(), 'Pending')",
            [userID, totalAmount, paymentMethod]
        );

        const orderID = orderResult.insertId;

        // Save order details to `order_details` table
        await dbConnection.execute(
            "INSERT INTO `order_details`(`order_id`, `type`, `address`, `time`, `store`) VALUES (?, ?, ?, ?, ?)",
            [orderID, type, address || null, time || null, store || null]
        );

        res.json({ message: "Order saved successfully", orderID });
    } catch (error) {
        console.error("Error while saving order:", error);
        res.status(500).json({ error: "An error occurred while saving the order" });
    }
};

// Fetch all orders
exports.getLimitedOrderHistory = async (req, res) => {
    const userID = req.session.userID;

    if (!userID) {
        return res.status(401).json({ error: "User not logged in" });
    }

    try {
        const [orders] = await dbConnection.execute(
            `SELECT 
                o.order_id AS orderID, 
                o.order_date AS orderDate, 
                o.total_amount AS totalAmount, 
                GROUP_CONCAT(od.type SEPARATOR ', ') AS items
             FROM orders o
             LEFT JOIN order_details od ON o.order_id = od.order_id
             WHERE o.user_id = ?
             GROUP BY o.order_id
             ORDER BY o.order_date DESC
             LIMIT 3`,
            [userID]
        );

        res.json({ orders });
    } catch (error) {
        console.error("Error fetching limited orders:", error);
        res.status(500).json({ error: "Failed to fetch limited orders" });
    }
};


// Fetch limited number of orders (e.g., last 3)
exports.getOrderHistory = async (req, res, next) => {
    const userID = req.session.userID;

    if (!userID) {
        return res.status(400).json({ error: "User not logged in" });
    }

    try {
        const [orders] = await dbConnection.execute(
            `SELECT 
                o.order_id AS orderID, 
                o.order_date AS orderDate, 
                o.total_amount AS totalAmount, 
                GROUP_CONCAT(od.type) AS items 
             FROM orders o
             LEFT JOIN order_details od ON o.order_id = od.order_id
             WHERE o.user_id = ?
             GROUP BY o.order_id
             ORDER BY o.order_date DESC`,
            [userID]
        );

        res.json({ orders });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ error: "An error occurred while fetching order history" });
    }
};



exports.profilePage = async (req, res, next) => {
    const userID = req.session.userID;

    if (!userID) {
        return res.redirect('/login'); // Redirect if the user is not logged in
    }

    try {
        // Fetch user details
        const [user] = await dbConnection.execute(
            "SELECT name, phonenumber FROM users WHERE id = ?",
            [userID]
        );

        // Fetch the total number of orders
        const [totalOrdersResult] = await dbConnection.execute(
            "SELECT COUNT(*) AS totalOrders FROM orders WHERE user_id = ?",
            [userID]
        );

        const totalOrders = totalOrdersResult[0].totalOrders || 0;

        if (user.length > 0) {
            res.render("profile", { 
                user: user[0], 
                totalOrders  
            });
        } else {
            res.redirect("/login"); 
        }
    } catch (error) {
        console.error("Error fetching user profile:", error.message);
        res.status(500).send("An error occurred while loading the profile.");
    }
};

exports.saveReview = async (req, res) => {
    const userID = req.session.userID; 
    const { reviewText } = req.body; 

    if (!userID) {
        return res.status(401).json({ error: "User not logged in" });
    }

    if (!reviewText || reviewText.trim() === "") {
        return res.status(400).json({ error: "Review text is required" });
    }

    try {
        await dbConnection.execute(
            "INSERT INTO reviews (user_id, review_text) VALUES (?, ?)",
            [userID, reviewText]
        );
        res.json({ message: "Review saved successfully" });
    } catch (error) {
        console.error("Error saving review:", error);
        res.status(500).json({ error: "An error occurred while saving the review" });
    }
};