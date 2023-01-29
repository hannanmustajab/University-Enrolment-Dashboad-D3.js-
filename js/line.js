// const margin = { top: 20, right: 20, bottom: 30, left: 50 },
//   width = 960 - margin.left - margin.right,
//   height = 500 - margin.top - margin.bottom;

// const svg = d3.select("#line-chart")
//   .append("svg")
//   .attr("width", width + margin.left + margin.right)
//   .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// const x = d3.scaleLinear().range([0, width]);
// const y = d3.scaleLinear().range([height, 0]);

// d3.csv("../csv/processed/students_by_country_year.csv").then(function (data) {

//   console.log(data[0]);
//   var columns = Object.keys(data[0]);
//   columns.shift();
//   console.log(columns); t


//   var select = d3.select("#selectColumn")
//     .append("select")
//     .attr("class", "select")
//     .on("change", update);
//   select.selectAll("option")
//     .data(columns)
//     .enter()
//     .append("option")
//     .attr("value", function (d) { return d; })
//     .text(function (d) { return d; });

//   var x = d3.scaleLinear().range([0, width]);
//   var y = d3.scaleLinear().range([height, 0]);

//   var line = d3.line()
//     .x(function (d) { return x(d.year); })
//     .y(function (d) { return y(d[selected]); });

//   function update() {
//     selected = this.value;
//     x.domain(d3.extent(data, function (d) { return d.year; }));
//     y.domain(d3.extent(data, function (d) { return d[selected]; }));

//     svg.selectAll("path").remove();
//     svg.append("path")
//       .datum(data)
//       .attr("class", "line")
//       .attr("d", line);
//     svg.select(".x-axis").call(d3.axisBottom(x));
//     svg.select(".y-axis").call(d3.axisLeft(y));
//   }

//   update();
// });


// set the dimensions and margins of the graph
var margin = { top: 10, right: 100, bottom: 30, left: 30 },
  width = 560 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

//Read the data
//d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_connectedscatter.csv", function (data) {
d3.csv("csv/processed/students_by_country_year.csv", function (data) {

  console.log(data);
  // List of groups (here I have one group per column)
  // var allGroup = ["valueA", "valueB", "valueC"]
  var allGroup = ["India", "Pakistan", "Itay"]

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
  var x = d3.scaleLinear()
    .domain(d3.extent(data, function (d) { return d.time; }))
    .range([0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 1700000])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Initialize line with group a
  var line = svg
    .append('g')
    .append("path")
    .datum(data)
    .attr("d", d3.line()
      .x(function (d) { return x(+d.time) })
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
    console.log(dataFilter);
    // Give these new data to update line
    line
      .datum(dataFilter)
      .transition()
      .duration(1000)
      .attr("d", d3.line()
        .x(function (d) { return x(+d.time) })
        .y(function (d) { return y(+d.value) })
      )
      .attr("stroke", function (d) { return myColor(selectedGroup) })
  }

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function (d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    // run the updateChart function with this selected option
    update(selectedOption)
  })

})
