const url = "http://127.0.0.1:5000/api/v1.0/names";

// Set up chart dimensions
const margin = { top: 20, right: 30, bottom: 60, left: 40 }; // Increased bottom margin for axis labels
const width = 1500 - margin.left - margin.right;
const height = 1300 - margin.top - margin.bottom;

// Create svg element
const svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Fetch data from the API
d3.json(url)
  .then(data => {
    const results = data.results;

    // Extract unique categories and regions for dropdown options
    const uniqueCategories = ["All", ...Array.from(new Set(results.map(d => d.category)))];
    const uniqueRegions = ["All", ...Array.from(new Set(results.map(d => d.regions)))];

    // Populate category dropdown
    const categorySelect = d3.select("#categorySelect");
    categorySelect.selectAll("option")
      .data(uniqueCategories)
      .enter().append("option")
      .text(d => d)
      .attr("value", d => d);

    // Populate region dropdown
    const regionSelect = d3.select("#regionSelect");
    regionSelect.selectAll("option")
      .data(uniqueRegions)
      .enter().append("option")
      .text(d => d)
      .attr("value", d => d);

    // Function to update the chart based on selected category and region
    function updateChart(selectedCategory, selectedRegion) {
      // Filter data based on selected category and region
      const filteredData = results.filter(d =>
        (selectedCategory === "All" || d.category === selectedCategory) &&
        (selectedRegion === "All" || d.regions === selectedRegion)
      );

      // Extract and group data by decade from the start date
      const startdateSet = d3.group(filteredData, d => {
        const year = new Date(d.startdate).getFullYear();
        return `${Math.floor(year / 10) * 10}`;
      });

      // Create a bar chart based on the number of entries for each decade
      const startdateBarData = Array.from(startdateSet, ([decade, entries]) => ({
        decade,
        categories: Array.from(d3.group(entries, d => d.category), ([category, catEntries]) => ({
          category,
          count: catEntries.length,
        })),
      }));

      // Set up scales
      const xScale = d3.scaleBand()
        .domain(startdateBarData.map(d => d.decade))
        .range([0, width])
        .padding(0.1)
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(startdateBarData, d => d3.sum(d.categories, c => c.count))])
        .range([height, 0]);

      // Color scale for different categories
      const colorScale = d3.scaleOrdinal()
        .domain(uniqueCategories)
        .range(d3.schemeCategory10);

      // Update or create bars with the new data
      const bars = svg.selectAll(".bar-group")
        .data(startdateBarData);

      bars.exit().remove(); // Remove bars that are no longer needed

      const newBars = bars.enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(${xScale(d.decade)},0)`)
        .merge(bars);

      newBars.selectAll(".bar")
        .data(d => d.categories)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.category))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.count))
        .attr("fill", d => colorScale(d.category))
        .on("mouseover", function (event, d) {
          // Show tooltip with category, count, and decade
          const tooltip = d3.select("#tooltip");
          tooltip.transition().duration(200).style("opacity", .9);
          tooltip.html(`${d.category}<br/>Count: ${d.count}<br/>Decade: ${d3.select(this.parentNode).datum().decade}`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
          // Hide tooltip on mouseout
          const tooltip = d3.select("#tooltip");
          tooltip.transition().duration(500).style("opacity", 0);
        });

      // Merge new bars with existing ones
      newBars.selectAll(".bar").transition().duration(500)
        .attr("y", d => yScale(d.count))
        .attr("height", d => height - yScale(d.count));

      // Update X and Y axes
      svg.select(".x-axis")
          .call(d3.axisBottom(xScale)
            .tickValues(xScale.domain())
            .tickFormat(d => d.substring(0, 4)) // Extract the first 4 characters (year) from the decade
      )
      .attr("transform", `translate(0,${height})`); // Move X-axis to the bottom

      // Axis Labels
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count");

      svg.append("text")
        .attr("transform", `translate(${width / 2},${height + margin.top + 20})`)
        .style("text-anchor", "middle")
        .text("Year");
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