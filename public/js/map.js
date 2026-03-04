// Initialize the map after the page loads
document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([50.2839, 57.167], 6); // Centered on Kazakhstan

    // Add the base layer of the map (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Define the cities with their coordinates
    const cities = {
        "aktobe": [50.2839, 57.167],
        "atyrau": [47.0945, 51.9235],
        "astana": [51.1694, 71.4491],
        "aktau": [43.6561, 51.1975],
        "kulsary": [46.9787, 54.0196],
        "khromtau": [50.2613, 58.4436]
    };

    // Add markers for each city
    Object.keys(cities).forEach(city => {
        const [lat, lon] = cities[city];
        L.marker([lat, lon]).addTo(map).bindPopup(`Store in ${city.charAt(0).toUpperCase() + city.slice(1)}`);
    });

    // Search functionality
    document.getElementById("search-input").addEventListener("keydown", function (event) {
        if (event.key === "Enter") { // Trigger search on Enter key
            const searchValue = event.target.value.trim().toLowerCase(); // Convert input to lowercase
            if (cities[searchValue]) {
                // If city is found, move the map to its location
                map.setView(cities[searchValue], 13);
                document.getElementById("not-found-message").style.display = "none"; // Hide "not found" message
            } else {
                // Show "not found" message if city is not in the list
                document.getElementById("not-found-message").style.display = "block";
            }
        }
    });
});
