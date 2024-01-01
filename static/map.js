
//Ensure scripts are loaded 
url = "http://127.0.0.1:5000/get_data"

categoryColor = ["#FF5733", "#33FF57", "#5733FF", "#FF33A1", "#33A1FF", 
                "#A1FF33", "#FF3333", "#33FFA1", "#A133FF", "#FFA133", 
                "#33FF33", "#3333FF", "#FF33FF", "#33FFFF", "#FFFF33", 
                "#FF6633", "#33FF66", "#6633FF", "#FF3366", "#3366FF"]

categoryNames = ["Cyclone","Flood","Environmental","Transport","Shipwreck",
                "Bushfire","Severe Storm","Industrial","Chemical","Hail","Epdiemic",
                "Crimnal Act","Complex Emergencies","Urban Fire","Tornade","Envionmental",
                "Environmental – Drought, Queensland and New South Wales 2012"]

document.addEventListener('DOMContentLoaded', function() {
    d3.json(url).then(d => {

        let data = d.results

        let groupData = d3.group(data, d=>d.regions,d=>d.category)
        console.log(groupData)

        ////////////////////////////
        ///// Inital Map graph /////
        ////////////////////////////

        let map = L.map('map').setView([-25.529640517746024, 134.13308897243968], 3);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    plotMarkers("Queensland","Cyclone")
    
    // Function plot markers from category 
    function plotMarkers(region,category) {
        indexValue = categoryNames.indexOf(category)
        
        if (groupData.get(region).get(category)) {
            for (i = 0; i < groupData.get(region).get(category).length; i++) { 
            
                lat = groupData.get(region).get(category)[i].latitude
                long = groupData.get(region).get(category)[i].logitude

                circleMarker = L.circleMarker([lat,long], {
                        radius:5,
                        color:categoryColor[indexValue],
                        fillOpacity:0.7
                    }).addTo(map).bindPopup(`<p>${category}<br />${groupData.get(region).get(category)[i].description}</p>`).openPopup()
        }
    }}

    // Get all the categories
    console.log(groupData.get("Victoria"))
    console.log(groupData.get("Victoria"))


    //Function delete markers 
    function deleteMarkers() {
        d3.selectAll(".leaflet-interactive").remove()
    };

    //Function Run plotMarkers with all the categories 
    function categoryMarkers(region) {
        for (let i = 0; i<categoryNames.length; i++) {
            plotMarkers(region,categoryNames[i])
        }
    }
    
    ///////////////////////////////
    ///// Check menu selection ////
    ///////////////////////////////

        // Selecting drop down menu from html code
        let button = d3.select("#statesFilter");

        // Checks if drop down menu was changed
        button.on("change", function(value) {
            selectElement = document.querySelector("#statesFilter");
            output = selectElement.value
            console.log(output)
            
            deleteMarkers();
            optionChanged(output);
        })
        
        //Function optionChange, Change data & graph based on menu
        function optionChanged(value) { 
            //deleteMarkers();
            categoryMarkers(value)
        }


    }).catch(function(error) {
        console.log(error)
    }) // end
})
