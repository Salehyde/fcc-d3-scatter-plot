fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
  .then(response => response.json())
  .then(data => drawChart(data));

function drawChart(data) {
  const width = 800;
  const height = 400;
  const margin = { top: 50, right: 50, bottom: 50, left: 80 };

  const svg = d3.select("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Parse data for x (years) and y (time in minutes:seconds as Date)
  const parseTime = d3.timeParse("%M:%S");
  const timeFormat = d3.timeFormat("%M:%S");

  data.forEach(d => {
    d.Seconds = parseTime(`${Math.floor(d.Seconds / 60)}:${d.Seconds % 60}`);
  });

  const xDomain = d3.extent(data, d => new Date(d.Year, 0));
  const xScale = d3.scaleTime()
                   .domain([d3.timeYear.offset(xDomain[0], -1), d3.timeYear.offset(xDomain[1], 1)])
                   .range([0, width]);

  const yDomain = d3.extent(data, d => d.Seconds);
  const yScale = d3.scaleTime()
                   .domain([d3.timeSecond.offset(yDomain[0], -10), yDomain[1]]) // Add padding to the y-axis
                   .range([0, height]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
  const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

  svg.append("g")
     .attr("id", "x-axis")
     .attr("transform", `translate(0, ${height})`)
     .call(xAxis);

  svg.append("g")
     .attr("id", "y-axis")
     .call(yAxis);

  // Plot points
  svg.selectAll(".dot")
     .data(data)
     .enter()
     .append("circle")
     .attr("class", "dot")
     .attr("cx", d => xScale(new Date(d.Year, 0)))
     .attr("cy", d => yScale(d.Seconds))
     .attr("r", 5)
     .attr("data-xvalue", d => d.Year)
     .attr("data-yvalue", d => d.Seconds.toISOString())
     .style("fill", d => (d.Doping ? "lightcoral" : "lightgreen")) // Conditionally set color
     .on("mouseover", (event, d) => {
       d3.select("#tooltip")
         .style("opacity", 1)
         .attr("data-year", d.Year)
         .html(
           `Year: ${d.Year}<br>Time: ${timeFormat(d.Seconds)}<br>${d.Doping ? d.Doping : "No Allegations"}`
         )
         .style("left", `${event.pageX + 10}px`)
         .style("top", `${event.pageY - 30}px`);
     })
     .on("mouseout", () => {
       d3.select("#tooltip").style("opacity", 0);
     });

  // Legend
  const legend = svg.append("g")
                    .attr("id", "legend")
                    .attr("transform", `translate(${width - 150}, ${margin.top})`);

  legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "lightgreen");

  legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text("No doping allegations");

  legend.append("rect")
        .attr("x", 0)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "lightcoral");

  legend.append("text")
        .attr("x", 20)
        .attr("y", 32)
        .text("Doping allegations");
}
