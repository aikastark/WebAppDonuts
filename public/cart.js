var navigation = document.getElementById("navigation");
navigation.style.right = "-300px";

function openFunction() {
    document.getElementById("navigation").style.right = "0";
    document.getElementById("menuicon").style.display = "none";
    document.getElementById("closeicon").style.display = "inline";
}

function closeFunction() {
    document.getElementById("navigation").style.right = "-300px";
    document.getElementById("menuicon").style.display = "inline";
    document.getElementById("closeicon").style.display = "none";
}

// Load cart items and display them
function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItemsContainer = document.getElementById("cart-items");
    const totalPriceContainer = document.getElementById("total-price");

    cartItemsContainer.innerHTML = ""; // Clear container
    let totalPrice = 0; // Reset total price

    // Loop through each cart item
    cart.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");

        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>Price: ${item.price}</p>
                <div class="quantity-controls">
                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    <span>Quantity: ${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);

        // Calculate total price
        totalPrice += parseFloat(item.price.replace('₸', '')) * item.quantity;
    });

    // Display total price and save to localStorage
    totalPriceContainer.innerHTML = `Total: ₸${totalPrice.toFixed(2)}`;
    localStorage.setItem("totalPayment", totalPrice.toFixed(2)); // Save total price for payment page
}

// Function to change the quantity of an item
function changeQuantity(index, change) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart[index]) {
        cart[index].quantity += change;

        // Remove item if quantity is zero or less
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
    }

    localStorage.setItem("cart", JSON.stringify(cart)); // Save updated cart
    loadCart(); // Reload cart
}

// Function to clear the cart
function clearCart() {
    localStorage.removeItem("cart");
    localStorage.removeItem("totalPayment"); // Clear total payment as well
    loadCart();
}

// Navigate back
function goBack() {
    window.history.back();
}

// Load cart when the page loads
loadCart();
