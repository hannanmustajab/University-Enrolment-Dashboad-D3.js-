const margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const svg = d3.select("#line-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

d3.csv("../csv/processed/students_by_country_year.csv").then(function(data) {
    console.log(data[0]);
    var columns = Object.keys(data[0]);
    columns.shift();
    console.log(columns);
    var select = d3.select("#selectColumn")
      .append("select")
      .attr("class", "select")
      .on("change", update);
    select.selectAll("option")
      .data(columns)
      .enter()
      .append("option")
      .attr("value", function(d) { return d; })
      .text(function(d) { return d; });
  
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
  
    var line = d3.line()
      .x(function(d) { return x(d.year); })
      .y(function(d) { return y(d[selected]); });
  
    function update() {
      selected = this.value;
      x.domain(d3.extent(data, function(d) { return d.year; }));
      y.domain(d3.extent(data, function(d) { return d[selected]; }));
  
      svg.selectAll("path").remove();
      svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
      svg.select(".x-axis").call(d3.axisBottom(x));
      svg.select(".y-axis").call(d3.axisLeft(y));
    }
  
    update();
  });
  