// Define url
const url = "http://127.0.0.1:5000/get_data";

let data;

// Define a color scale globally
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

d3.json(url).then(d => {
    console.log(d.results);
    data = d.results;

    //Begin drop down menu preparation
    let dropdown = document.getElementById('selState');
    let states = [...new Set(data.map(item => item.regions))]; 

    // Populate the dropdown
    states.forEach(state => {
        let option = document.createElement('option');
        option.value = state;
        option.text = state;
        dropdown.appendChild(option);
    });

    // Event listener for dropdown change
    dropdown.addEventListener('change', function() {
        const selectedState = this.value;
        updateCharts(selectedState);
    });

    // Initial pie charts for the default state
    const defaultState = states[0];
    updateCharts(defaultState);
});

function updateCharts(selectedState) {
    // Remove any previously rendered SVG so one set of chosen graphs are showing at a time
    d3.select("#deathsPie svg").remove();
    d3.select("#injuriesPie svg").remove();
    d3.select("#deathsLegend ul").remove();
    d3.select("#injuriesLegend ul").remove();

    // Create SVG for deaths pie chart and its legend
    const deathsSvg = createPieChart("#deathsPie", selectedState, "Deaths", "Total deaths caused by different types of Disasters");
    createLegend("#deathsLegend", deathsSvg, "Deaths");

    // Create SVG for injuries pie chart and its legend
    const injuriesSvg = createPieChart("#injuriesPie", selectedState, "Injuries", "Total injuries caused by different types of Disasters");
    createLegend("#injuriesLegend", injuriesSvg, "Injuries");
}

// Create Pie Charts
function createPieChart(divId, selectedState, valueType, titleText) {
    const filteredData = data.filter(item => item.regions === selectedState);

    const rollupData = d3.rollup(
        filteredData,
        v => d3.sum(v, d => d[valueType.toLowerCase()]),
        d => d.category
    );

    // Ensure consistent order of categories for both pie chart and legend
    const orderedCategories = Array.from(rollupData).map(d => d[0]);

    const color = colorScale.domain(orderedCategories);  // Set domain for consistent color mapping
    const arc = d3.arc().innerRadius(0).outerRadius(125);
    const pie = d3.pie().value(d => d[1]);
    const pieChartData = pie(Array.from(rollupData));

    
    const svg = d3.select(divId)
    .append("svg")
    .attr("width", 250)
    .attr("height", 250)
    .append("g")
    .attr("transform", "translate(125,125)");

    // Add Title
    d3.select(divId)
    .append("div")
    .style("text-align", "center")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text(titleText);

    // Add Slices
    svg.selectAll("path")
        .data(pieChartData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(d.data[0]))
        .append("title")
        .text(d => `${d.data[0]}: ${d.data[1]} ${valueType}`);

    return svg;
}

function createLegend(divId, svg, valueType) {
    const rollupData = d3.rollup(
        data,
        v => d3.sum(v, d => d[valueType.toLowerCase()]),
        d => d.category
    );

    const legendData = Array.from(rollupData).map(d => d[0]);  // Get categories in the same order

    const legend = d3.select(divId)
        .append("ul")
        .attr("class", "legend");

    const items = legend.selectAll("li")
        .data(legendData)
        .enter()
        .append("li");

    items.append("span")
        .attr("class", "legend-color")
        .style("background-color", d => colorScale(d));  // Use color scale for consistent coloring

    items.append("span")
        .text(d => `${d}: ${rollupData.get(d)} ${valueType}`);
}
