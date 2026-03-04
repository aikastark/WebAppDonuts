function selectDelivery() {
    document.getElementById("deliveryFields").style.display = "block";
    document.getElementById("pickupFields").style.display = "none";
}

function selectPickup() {
    document.getElementById("deliveryFields").style.display = "none";
    document.getElementById("pickupFields").style.display = "block";
}

function displaySuccessMessage(isDelivery) {
    const message = isDelivery
        ? "Your order will be delivered to your address shortly. Please wait for a call."
        : "You can pick up your order at the chosen store at the specified time.";
    document.getElementById("orderMessage").innerText = message;
    document.getElementById("successMessage").style.display = "block";
}

async function saveOrderDataToDB(paymentMethod) {
    const isDelivery = document.getElementById("deliveryFields").style.display === "block";
    const totalPayment = localStorage.getItem("totalPayment") || "0.00";
    const type = isDelivery ? "Delivery" : "Pickup";
    const address = isDelivery ? document.getElementById("address")?.value || null : null;
    const time = isDelivery
        ? document.getElementById("deliveryTime")?.value || null
        : document.getElementById("pickupTime")?.value || null;
    const store = !isDelivery ? document.getElementById("store")?.value || null : null;

    if (!paymentMethod || !type || totalPayment === "0.00" || (!isDelivery && !store)) {
        alert("Please fill out all required fields.");
        return;
    }

    const orderData = {
        paymentMethod,
        type,
        address,
        time,
        store,
        totalAmount: parseFloat(totalPayment).toFixed(2),
    };

    console.log("Order data being sent:", orderData);

    try {
        const response = await fetch("/save-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Order saved successfully!");
        } else {
            console.error(result.error);
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("An error occurred:", error);
        alert("Failed to save order. Please try again.");
    }
}

function validateFields(isDelivery) {
    if (isDelivery) {
        const address = document.getElementById("address").value.trim();
        const deliveryTime = document.getElementById("deliveryTime").value.trim();
        if (!address || !deliveryTime) {
            alert("Please fill out the delivery address and time.");
            return false;
        }
    } else {
        const store = document.getElementById("store").value.trim();
        const pickupTime = document.getElementById("pickupTime").value.trim();
        if (!store || !pickupTime) {
            alert("Please select a store and specify the pickup time.");
            return false;
        }
    }
    return true;
}

function payOnReceipt() {
    const isDelivery = document.getElementById("deliveryFields").style.display === "block";

    if (!validateFields(isDelivery)) {
        return;
    }

    displaySuccessMessage(isDelivery);
    saveOrderDataToDB("Pay Upon Receipt");
}

function payWithKaspi() {
    const isDelivery = document.getElementById("deliveryFields").style.display === "block";

    if (!validateFields(isDelivery)) {
        return;
    }

    const modal = document.getElementById("kaspiModal");
    modal.style.display = "flex";

    const closeModalButton = document.getElementById("closeModalButton");
    closeModalButton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    saveOrderDataToDB("Kaspi.kz");
}

function cancelPayment() {
    localStorage.removeItem("totalPayment"); // Clear the payment total from storage
    window.location.href = "/cart"; // Redirect back to cart page
}

function closeModal() {
    document.getElementById("successMessage").style.display = "none";
}

document.getElementById("deliveryBtn").addEventListener("click", function () {
    this.classList.add("active");
    document.getElementById("pickupBtn").classList.remove("active");
});

document.getElementById("pickupBtn").addEventListener("click", function () {
    this.classList.add("active");
    document.getElementById("deliveryBtn").classList.remove("active");
});

// Display the total payment amount
function displayTotalPayment() {
    const totalPayment = localStorage.getItem("totalPayment");

    if (!totalPayment || isNaN(totalPayment)) {
        document.getElementById("total-payment").innerText = `₸0.00`; // Default to ₸0.00
        return;
    }

    document.getElementById("total-payment").innerText = `₸${parseFloat(totalPayment).toFixed(2)}`;
}

// Call this function on page load
displayTotalPayment();
