// Sample data (replace this with your actual data fetching logic)
const url = "http://127.0.0.1:5000/api/v1.0/names";

// Fetch data from the API
d3.json(url).then(data => {
  const results = data.results;

  // Order the data by start date
  results.sort((a, b) => new Date(a.startdate) - new Date(b.startdate));

  // Extract and group data by decade from the start date
  const stackedData = d3.stack()
    .keys([...new Set(results.map(d => d.category))])
    .value((d, key) => results.filter(item => item.category === key && Math.floor(new Date(item.startdate).getFullYear() / 10) === Math.floor(new Date(d.startdate).getFullYear() / 10)).length)
    (results);

  // Extract unique decades from the start dates
  const uniqueDecades = [...new Set(results.map(d => Math.floor(new Date(d.startdate).getFullYear() / 10) * 10))];

  // Set up the chart dimensions
  const margin = { top: 20, right: 30, bottom: 30, left: 40 };
  const width = 1500 - margin.left - margin.right;
  const height = 1300 - margin.top - margin.bottom;

  // Create svg element
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create X and Y scales
  const xScale = d3.scaleBand()
    .domain(uniqueDecades)
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
    .range([height, 0]);

  // Create color scale
  const color = d3.scaleOrdinal()
    .domain(stackedData.map(d => d.key))
    .range(d3.schemeCategory10);

  // Create X and Y axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // Append X and Y axes to the svg
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

  // Create stacked bars with custom tooltips
  svg.selectAll(".bar")
    .data(stackedData)
    .enter().append("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("x", d => xScale(Math.floor(new Date(d.data.startdate).getFullYear() / 10) * 10))
    .attr("y", d => yScale(d[1]))
    .attr("height", d => yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth())
    .on("mouseover", function (event, d) {
      const tooltip = d3.select("#tooltip");
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`${d.data.category}<br>Count: ${d[1] - d[0]}<br>Decade: ${Math.floor(new Date(d.data.startdate).getFullYear() / 10) * 10}`)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function (d) {
      d3.select("#tooltip").transition()
        .duration(500)
        .style("opacity", 0);
    });

  // Add legend
  const legend = svg.selectAll(".legend")
    .data(stackedData.map(d => d.key))
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", color);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => d);
});