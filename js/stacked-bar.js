// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 20, left: 50 },
  width_stackbar = 550 - margin.left - margin.right,
  height_stackbar = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_stack = d3.select("#stacked_bar")
  .append("svg")
  .attr("width", width_stackbar + margin.left + margin.right)
  .attr("height", height_stackbar + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("../csv/processed/income_group_by_year.csv", function (data) {
  // console.log(data);

  // List of subgroups = header of the csv files = soil condition here
  var subgroups = data.columns.slice(1)

  var parsetime = d3.timeParse("%Y-%m-%d");
  data.forEach(function (d) {
    d.year = parsetime(d.year);
  });
  data.forEach(function (d) {
    d.year = d.year.getFullYear();
  });

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  var groups = d3.map(data, function (d) { return (d.year) }).keys()

  // Add X axis
  var x = d3.scaleBand()
    .domain(groups)
    .range([0, width_stackbar])
    .padding([0.2])
  svg_stack.append("g")
    .attr("transform", "translate(0," + height_stackbar + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 200000000])
    .range([height_stackbar, 0]);
  svg_stack.append("g")
    .call(d3.axisRight(y));

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(["rgb(158,202,225)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,48,107)"])

  //stack the data? --> stack per subgroup
  var stackedData = d3.stack()
    .keys(subgroups)
    (data)

  // ----------------
  // Create a tooltip
  // ----------------
  var tooltip = d3.select("#stacked_bar")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function (d) {
    var subgroupName = d3.select(this.parentNode).datum().key;
    var subgroupValue = d.data[subgroupName];
    tooltip
      .html(subgroupName + "<br>" + d3.format(".2s")(subgroupValue))
      .style("opacity", 1)
  }
  var mousemove = function (d) {
    tooltip
      .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function (d) {
    tooltip
      .style("opacity", 0)
  }


  // -------------
  // ADD LEGENDS
  //--------------
  // Add one dot in the legend for each name.
  var size = 20
  svg_stack.selectAll("mydots")
    .data(subgroups)
    .enter()
    .append("rect")
    .attr("x", 70)
    .attr("y", function (d, i) { return 5 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function (d) { return color(d) })

  // Add one dot in the legend for each name.
  svg_stack.selectAll("mylabels")
    .data(subgroups)
    .enter()
    .append("text")
    .attr("x", 70 + size * 1.2)
    .attr("y", function (d, i) { return 5 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) { return color(d) })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")


  // Show the bars
  svg_stack.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
    .attr("fill", function (d) { return color(d.key); })
    .selectAll("rect")
    // enter a second time = loop subgroup per subgroup to add all rectangles
    .data(function (d) { return d; })
    .enter().append("rect")
    .attr("x", function (d) { return x(d.data.year); })
    .attr("y", function (d) { return y(d[1]); })
    .attr("height", function (d) { return y(d[0]) - y(d[1]); })
    .attr("width", x.bandwidth())
    .attr("stroke", "grey")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

})
