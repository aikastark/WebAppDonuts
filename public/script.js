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

