// Define the URL
url = "http://127.0.0.1:5000/get_data";

// Fetch data from the URL
document.addEventListener('DOMContentLoaded', function() {
d3.json(url)
    .then(d => {
        // Log the fetched data for debugging
        // console.log(d.results);
        
        // Extract data
        const data = d.results;

        // Function to filter data by state
        function filterDataByState(data, state) {
            if (state === "all") return data;
            return data.filter(item => item.regions === state);
        }

        // Function to aggregate data
        function getAggregatedData(filteredData, key) {
            const aggregatedData = {};

            filteredData.forEach(item => {
                if (!aggregatedData[item.category]) {
                    aggregatedData[item.category] = 0;
                }
                aggregatedData[item.category] += item[key];
            });

            return aggregatedData;
        }
        
        //Function to draw a pie chart with legend on the right side
        function drawPieChart(data, categories, chartId) {
             d3.select(`#${chartId}`).selectAll('*').remove(); // This clears the appropriate SVG container
        
            const width = 600;
            const height = 400;
            const radius = Math.min(width, height) / 2;
        
            const svg = d3.select(`#${chartId}`)
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${width / 3}, ${height / 2})`);
        
            const color = d3.scaleOrdinal()
                .domain(categories)
                .range(d3.schemeCategory10);
        
            const pie = d3.pie()
                .value(d => data[d]);
        
            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);
        
            // Bind data to path elements
            const arcs = svg.selectAll("path")
                .data(pie(categories));
        
            // Remove old paths
            arcs.exit().remove();
        
            // Add new paths
            arcs.enter().append("path")
                .attr("fill", d => color(d.data))
                .attr("d", arc)
                .merge(arcs) // Merge enter and update selections
                .attr("fill", d => color(d.data))
                .attr("d", arc);
        
            // Legend
            const legend = svg.selectAll(".legend")
                .data(categories);
        
            // Remove old legends
            legend.exit().remove();
        
            // Add new legends
            const newLegend = legend.enter().append("g")
                .attr("class", "legend")
                .attr("transform", (d, i) => `translate(190,${i * 20 - 150})`);
        
            newLegend.append("rect")
                .attr("x", 20)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", d => color(d));
        
            newLegend.append("text")
                .attr("x", 50)
                .attr("y", 9)
                .attr("dy", ".35em")
                .text(d => `${d}: ${data[d]}`); 
    
     // Create a tooltip element
     const tooltip = d3.select(`#${chartId}`)
     .append("div")
     .attr("class", "tooltip")
     .style("opacity", 0);

     
}       
    // Function to update charts
function updateCharts(data) {
  
    // Initial draw with all data
    const deathsData = getAggregatedData(data, 'deaths');
    const injuriesData = getAggregatedData(data, 'injuries');
    drawPieChart(deathsData, Object.keys(deathsData), 'deathsChart');
    drawPieChart(injuriesData, Object.keys(injuriesData), 'injuriesChart');
}

// Function to handle state selector change
function handleStateChange(data) {
    console.log("State changed!"); 
    const filteredData = filterDataByState(data, this.value);
    const deathsData = getAggregatedData(filteredData, 'deaths');
    const injuriesData = getAggregatedData(filteredData, 'injuries');
    
    // Draw new charts with filtered data
    drawPieChart(deathsData, Object.keys(deathsData), 'deathsChart');
    drawPieChart(injuriesData, Object.keys(injuriesData), 'injuriesChart');
}

// Initialize the charts with the fetched data
d3.json("http://127.0.0.1:5000/get_data")
    .then(d => {
        // console.log(d.results);
        const data = d.results;
        updateCharts(data);
        
        // Attach event listener and handle state changes
        const stateSelector = document.getElementById('stateSelector');
        // stateSelector.removeEventListener('change', handleStateChange);  // Remove any existing event listener
        stateSelector.addEventListener('change', handleStateChange.bind(stateSelector, data));
    })
    .catch(error => {
        console.error("Error fetching the data:", error);
    });

    
    })});
