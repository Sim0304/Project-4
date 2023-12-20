
//Ensure scripts are loaded 
document.addEventListener('DOMContentLoaded', function() {
    
    let map = L.map('map').setView([-25.529640517746024, 134.13308897243968], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var marker = L.marker([51.5, -0.09]).addTo(map);
});

