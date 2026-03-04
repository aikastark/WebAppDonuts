// javascript code fpr the side-bar

// get the navigation menu element by its ID "navigation"
var navigation = document.getElementById("navigation")

// set the initial position of the navigation menu to be off-screen (hidden to the right)
navigation.style.right = "-300px";

// function to open the navigation menu
function openFunction(){
    document.getElementById("navigation").style.right = "0"; // move the navigation menu to the right edge of the screen
    document.getElementById("menuicon").style.display = "none"; // hide the menu icon (since the menu is now open)
    document.getElementById("closeicon").style.display = "inline"; // show the close icon to allow the user to close the menu
}

// function to close the navigation menu
function closeFunction(){
    document.getElementById("navigation").style.right = "-300px"; // move the navigation menu back off-screen (hidden to the right)
    document.getElementById("menuicon").style.display = "inline"; // show the menu icon again (for reopening the menu)
    document.getElementById("closeicon").style.display = "none"; // hide the close icon (since the menu is now closed)
}



function goBack() {
    window.history.back();
}

// Function to load order history dynamically
function loadOrderHistory() {
    const orders = JSON.parse(localStorage.getItem("orderHistory")) || []; // Retrieve order history from localStorage
    const orderHistoryBody = document.getElementById("order-history-body");

    orderHistoryBody.innerHTML = ""; // Clear any existing rows

    // Check if there are any orders
    if (orders.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `
            <td colspan="3" style="text-align: center;">No orders found</td>
        `;
        orderHistoryBody.appendChild(emptyRow);
        return;
    }

    // Loop through each order and add it to the table
    orders.forEach((order) => {
        const orderRow = document.createElement("tr");
        orderRow.innerHTML = `
            <td>${order.date}</td>
            <td>${order.items.map((item) => `${item.name} (${item.quantity})`).join(", ")}</td>
            <td class="price" data-price="${order.total}">$${parseFloat(order.total).toFixed(2)}</td>
        `;
        orderHistoryBody.appendChild(orderRow);
    });
}

// Save a new order to the history
function saveOrderToHistory(cart, totalPrice) {
    const orders = JSON.parse(localStorage.getItem("orderHistory")) || []; // Get existing orders
    const newOrder = {
        date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        items: cart, // Cart items
        total: totalPrice, // Total price of the order
    };

    orders.push(newOrder); // Add the new order
    localStorage.setItem("orderHistory", JSON.stringify(orders)); // Save back to localStorage
}

// Example usage when placing an order
function placeOrder() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalPrice = localStorage.getItem("totalPayment") || "0.00";

    if (cart.length === 0) {
        alert("Your cart is empty. Please add items before placing an order.");
        return;
    }

    // Save the order to history
    saveOrderToHistory(cart, totalPrice);

    // Clear the cart after placing the order
    localStorage.removeItem("cart");
    localStorage.removeItem("totalPayment");

    alert("Your order has been placed successfully!");

    // Reload the order history on the profile page
    loadOrderHistory();
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/orders');
        const data = await response.json();

        if (data.orders) {
            const orderTableBody = document.getElementById('order-history-body');
            const showMoreButton = document.getElementById('show-more-orders');

            orderTableBody.innerHTML = ''; // Clear the table before adding data
            const orders = data.orders;

            // Render the first 3 orders
            const maxVisibleOrders = 3;
            orders.slice(0, maxVisibleOrders).forEach(order => {
                const row = `
                    <tr>
                        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>${order.items || 'No items listed'}</td>
                        <td>₸${order.totalAmount || '0.00'}</td>
                    </tr>
                `;
                orderTableBody.innerHTML += row;
            });

            // Check if there are more than 3 orders
            if (orders.length > maxVisibleOrders) {
                showMoreButton.style.display = 'inline'; // Show the button
                let showingAll = false;

                // Add event listener to the button
                showMoreButton.addEventListener('click', () => {
                    if (!showingAll) {
                        // Show all orders
                        orders.slice(maxVisibleOrders).forEach(order => {
                            const row = `
                                <tr>
                                    <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>${order.items || 'No items listed'}</td>
                                    <td>${order.totalAmount || '0.00'}</td>
                                </tr>
                            `;
                            orderTableBody.innerHTML += row;
                        });
                        showMoreButton.textContent = 'Show Less';
                        showingAll = true;
                    } else {
                        // Hide all but the first 3 orders
                        orderTableBody.innerHTML = ''; // Clear the table
                        orders.slice(0, maxVisibleOrders).forEach(order => {
                            const row = `
                                <tr>
                                    <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>${order.items || 'No items listed'}</td>
                                    <td>₸${order.totalAmount || '0.00'}</td>
                                </tr>
                            `;
                            orderTableBody.innerHTML += row;
                        });
                        showMoreButton.textContent = 'Show More';
                        showingAll = false;
                    }
                });
            } else {
                showMoreButton.style.display = 'none'; // Hide the button if less than 3 orders
            }
        } else {
            alert('No orders found for this user.');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        alert('Failed to load order history.');
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const reviewForm = document.getElementById("review-form");

    if (reviewForm) {
        reviewForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const reviewText = reviewForm.querySelector("textarea").value;

            try {
                const response = await fetch("/api/reviews", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ reviewText }),
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    reviewForm.reset(); 
                } else {
                    alert(result.error); 
                }
            } catch (error) {
                console.error("Error submitting review:", error);
                alert("An error occurred while submitting your review.");
            }
        });
    }
});
