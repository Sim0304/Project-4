const url = "http://127.0.0.1:5000/get_data";

const margin = { top: 20, right: 30, bottom: 20000000, left: 40 };
const width = 1500 - margin.left - margin.right;
const height = 1300 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json(url)
  .then(data => {
    const results = data.results;

    const uniqueCategories = ["All", ...Array.from(new Set(results.map(d => d.category)))];
    const uniqueRegions = ["All", ...Array.from(new Set(results.map(d => d.regions)))];

    const categorySelect = d3.select("#categorySelect");
    categorySelect.selectAll("option")
      .data(uniqueCategories)
      .enter().append("option")
      .text(d => d)
      .attr("value", d => d);

    const regionSelect = d3.select("#regionSelect");
    regionSelect.selectAll("option")
      .data(uniqueRegions)
      .enter().append("option")
      .text(d => d)
      .attr("value", d => d);

      function updateChart(selectedCategory, selectedRegion) {
        const filteredData = results.filter(d =>
            (selectedCategory === "All" || d.category === selectedCategory) &&
            (selectedRegion === "All" || d.regions === selectedRegion)
        );
    
        const startdateSet = d3.group(filteredData, d => {
            const year = new Date(d.startdate).getFullYear();
            return `${Math.floor(year / 10) * 10}`;
        });
    
        // Create a set of all unique decades
        const allDecades = new Set(Array.from(startdateSet.keys()));
    
        // Fill in missing data for each category
        const startdateBarData = Array.from(allDecades, decade => {
            const entries = startdateSet.get(decade) || [];
            return {
                decade,
                count: d3.sum(entries, d => 1),
            };
        });
    
        // Sort the data by decade
        startdateBarData.sort((a, b) => parseInt(a.decade) - parseInt(b.decade));
    
        const xScale = d3.scaleBand()
            .domain(startdateBarData.map(d => d.decade))
            .range([0, width])
            .padding(0.1);
    
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(startdateBarData, d => d.count)])
            .range([height, 0]);
    
        // Check if x-axis element exists, and create it if not
        if (svg.select(".x-axis").empty()) {
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale)
                    .tickValues(xScale.domain())
                    .tickFormat(d => d.substring(0, 4))
                );
        } else {
            // Update x-axis
            svg.select(".x-axis")
                .call(d3.axisBottom(xScale)
                    .tickValues(xScale.domain())
                    .tickFormat(d => d.substring(0, 4))
                );
        }
    
        // Create or update y-axis
        svg.selectAll(".y-axis").remove(); // Remove existing y-axis
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale));
    
        // Bar drawing code
        svg.selectAll(".bar").remove(); // Remove existing bars
    
        svg.selectAll(".bar")
            .data(startdateBarData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.decade))
            .attr("y", d => yScale(d.count))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.count))
            .attr("fill", "steelblue");
    }
                

    // Initial chart update with no filters
    updateChart("All", "All");

    // Event listeners for dropdown changes
    categorySelect.on("change", function () {
      const selectedCategory = d3.select(this).property("value");
      updateChart(selectedCategory, regionSelect.property("value"));
    });

    regionSelect.on("change", function () {
      const selectedRegion = d3.select(this).property("value");
      updateChart(categorySelect.property("value"), selectedRegion);
    });
  })
  .catch(error => {
    console.error("Error fetching data:", error);
  });
