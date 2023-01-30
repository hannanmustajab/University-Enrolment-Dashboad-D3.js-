
// set the dimensions and margins of the graph
var margin = { top: 10, right: 100, bottom: 30, left: 30 },
  width = 560 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg_line = d3.select("#line-chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

//Read the data
//d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_connectedscatter.csv", function (data) {
d3.csv("csv/processed/students_by_country_year.csv", function (data) {


  var parsetime = d3.timeParse("%Y");
  data.forEach(function (d) {
    d.time = parsetime(d.time);
  });

  
  // List of groups (here I have one group per column)
  // var allGroup = ["valueA", "valueB", "valueC"]
  // var allGroup = ["India", "Pakistan", "Italy"]
  var allGroup = Object.keys(data[0]);
  allGroup.shift();

  // add the options to the button
  d3.select("#selectButton")
    .selectAll('myOptions')
    .data(allGroup)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button

  // A color scale: one color for each group
  var myColor = d3.scaleOrdinal()
    .domain(allGroup)
    .range(d3.schemeSet2);

  // Add X axis --> it is a date format
  var x = d3.scaleTime()
    .domain(d3.extent(data, function (d) { return (d.time); }))
    .range([0, width]);
    svg_line.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 1800000])
    .range([height, 0]);
    svg_line.append("g")
    .attr("class", "yaxis")
    .call(d3.axisRight(y));

  // Initialize line with group a
  var line = svg_line
    .append('g')
    .append("path")
    .datum(data)
    .attr("d", d3.line()
      .x(function (d) { return x(d.time) })
      .y(function (d) { return y(+d.Pakistan) })
    )


    .attr("stroke", function (d) { return myColor("valueA") })
    .style("stroke-width", 4)
    .style("fill", "none")

  // A function that update the chart
  function update(selectedGroup) {

    console.log(selectedGroup);
    // Create new data with the selection?
    var dataFilter = data.map(function (d) { return { time: d.time, value: d[selectedGroup] } })
    var max = d3.max(data, function (d) { return +d[selectedGroup] })

    y.domain([0, max]);

    // Give these new data to update line
    line
      .datum(dataFilter)
      .transition()
      .duration(1000)
      .attr("d", d3.line()
        .x(function (d) { return x(d.time) })
        .y(function (d) { return y(+d.value) })
      )
      .attr("stroke", function (d) { return myColor(selectedGroup) })

      svg_line.select('.yaxis')
      .transition()
      .duration(1000)
      .call(d3.axisRight(y));
  }

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function (d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    // run the updateChart function with this selected option
    update(selectedOption)
  })

})
