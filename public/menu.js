var navigation = document.getElementById("navigation")
navigation.style.right = "-300px";

function openFunction(){
    document.getElementById("navigation").style.right = "0";
    document.getElementById("menuicon").style.display = "none";
    document.getElementById("closeicon").style.display = "inline";
}

function closeFunction(){
    document.getElementById("navigation").style.right = "-300px";
    document.getElementById("menuicon").style.display = "inline";
    document.getElementById("closeicon").style.display = "none";
}


const addToCartButtons = document.querySelectorAll(".add-to-cart");

function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItemIndex = cart.findIndex(cartItem => cartItem.name === item.name);
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    showAddedToCartAnimation();
}

function showAddedToCartAnimation() {
    const cartIcon = document.querySelector("#menuicon");
    cartIcon.classList.add("added");
    setTimeout(() => {
        cartIcon.classList.remove("added");
    }, 500);
}

addToCartButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        const itemElement = e.target.closest(".menu-item, .menu-item1, .menu-item2, .menu-item3, .menu-item4, .menu-item5, .menu-item6, .menu-item7, .menu-item8, .menu-item9, .menu-item10, .menu-item11, .menu-item12");

        const item = {
            name: itemElement.querySelector("h2").textContent,
            price: itemElement.querySelector("span[class^='price']").textContent,
            image: itemElement.querySelector("img").src
        };

        addToCart(item);
    });
});

document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', (event) => {
        const menuItem = event.target.closest('.menu-item, .menu-item1, .menu-item2, .menu-item3, .menu-item4, .menu-item5, .menu-item6, .menu-item7, .menu-item8, .menu-item9, .menu-item10, .menu-item11, .menu-item12');
        const donutImg = menuItem.querySelector('img');
        const cartIcon = document.querySelector('.image-container img'); 

        if (!donutImg || !cartIcon) return; 

        const donutRect = donutImg.getBoundingClientRect();

        const cartRect = cartIcon.getBoundingClientRect();

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        const flyImg = donutImg.cloneNode(true);
        document.body.appendChild(flyImg);

        flyImg.style.position = 'absolute';
        flyImg.style.left = `${donutRect.left + scrollX}px`;
        flyImg.style.top = `${donutRect.top + scrollY}px`;
        flyImg.style.width = `${donutImg.offsetWidth}px`;
        flyImg.style.zIndex = '1000';

        gsap.to(flyImg, {
            duration: 1,
            x: cartRect.left - donutRect.left + (cartRect.width / 2) - scrollX,
            y: cartRect.top - donutRect.top + (cartRect.height / 2) - scrollY,
            scale: 0.2,
            opacity: 0,
            onComplete: () => flyImg.remove(), 
        });
    });
});
