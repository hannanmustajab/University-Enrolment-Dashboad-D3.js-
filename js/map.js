var width = 700,
    height = 300;

var svg = d3.select("#map")
    .append("svg")
    .style("cursor", "move");

svg.attr("viewBox", "50 10 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMin");

var zoom = d3.zoom()
    .on("zoom", function () {
        var transform = d3.zoomTransform(this);
        map.attr("transform", transform);
    });

svg.call(zoom);

var map = svg.append("g")
    .attr("class", "map");

    d3.queue()
    .defer(d3.json, "js/50m.json")
    .defer(d3.csv, "../csv/processed/merged_dataset.csv")
    .await(function (error, world, data) {
        if (error) {
            console.error('Oh dear, something went wrong: ' + error);
        }
        else {
            drawMap(world, data);
        }
    });

function drawMap(world, data) {
    // geoMercator projection
    var projection = d3.geoMercator() //d3.geoOrthographic()
        .scale(130)
        .scale(100)
        .translate([width / 2, height / 1.5]);

    // geoPath projection
    var path = d3.geoPath().projection(projection);

    var color = d3.scaleThreshold()
        .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
        .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);

    var features = topojson.feature(world, world.objects.countries).features;
    var populationById = {};


    data.forEach(function (d) {


        // Calculate % of public universities.
        const public_percentage = ((+d.Public) / (+d.Private + +d.Public)) * 100;
        // Calculate % of private universities.
        const private_percentage = 100 - public_percentage;
        populationById[d.countrycode] = {
            university: d.University,
            private: +d.Private,
            public: +d.Public,
            count: +d.total_students,
            year: d.founded_in,
            private_p: private_percentage,
            public_p: public_percentage

        }
    });

    features.forEach(function (d) {
        d.details = populationById[d.id] ? populationById[d.id] : {};
    });

    map.append("g")
        .selectAll("path")
        .data(features)
        .enter().append("path")
        .attr("name", function (d) {
            return d.id;
        })
        .attr("id", function (d) {
            return d.id;
        })
        .attr("d", path)
        .style("fill", function (d) {
            return d.details && d.details.count ? color(d.details.count) : undefined;
        })
        .on('mouseover', function (d) {
            d3.select(this)
                .style("stroke", "white")
                .style("stroke-width", 1)
                .style("cursor", "pointer");


            var DetailText = d.details.university + " is the oldest university in " + d.properties.name +
                ". It was founded in " + d.details.year + " and has " + d3.format(".2s")(d.details.count)
                + " students enrolled.";


            d3.select(".details")
                .text(DetailText)
                .style("font-size", "20px")
                .style("fill", "red");

            d3.select(".CountryCard")
                .text(d.properties.name);

            d3.select("#name_country")
                .text(d.properties.name);

            d3.select("#oldest_university")
                .text(d.details.university);

            d3.select(".private")
                .text(d.details.private);

            d3.select(".public")
                .text(d.details.public);

            d3.select(".countOfStudents")
                .text(d3.format(".2s")(d.details.count));

            d3.select(".countStudent")
                .text("Students enrolled: " + d3.format(".2s")(d.details.count));

            d3.select("#private_uni")
                .text(d3.format(".2s")(d.details.private_p) + '%');

            d3.select("#private_uni_progressbar")
                .style("width", d3.format(".2s")(d.details.private_p) + '%')
                .text('Private')


            d3.select("#public_uni_progressbar")
                .style("width", d3.format(".2s")(d.details.public_p) + '%')
                .text('Public')

            d3.select(".year")
                .text(d.details.year);

            d3.select('.details')
                .style('visibility', "visible")
            
            update(d.details);

        })
        .on('mouseout', function (d) {
            d3.select(this)
                .style("stroke", null)
                .style("stroke-width", 0.25);

            d3.select('.details')
                .style('visibility', "hidden");
        });
}







// set the dimensions and margins of the graph
var margin = { top: 10, right: 100, bottom: 30, left: 30 },
  width = 700 - margin.left - margin.right,
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
d3.csv("csv/processed/students_by_country_year.csv", function (data) {

  var parsetime = d3.timeParse("%Y-%m-%d");
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
    .range(["rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);

  // Add X axis --> it is a date format
  var x = d3.scaleTime()
    .domain(d3.extent(data, function (d) { return (d.time); }))
    .range([0, width]);
  svg_line.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 200000])
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
      .y(function (d) { return y(+d.Afghanistan) })
    )
    .attr("stroke", function (d) { return myColor("valueA") })
    .style("stroke-width", 4)
    .style("fill", "none")

  // Initialize dots with group a
  var dot = svg_line
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr("cx", function (d) { return x(+d.time) })
    .attr("cy", function (d) { return y(+d.Afghanistan) })
    .attr("r", 5)
    .style("fill", "#69b3a2")
  
    // A function that update the chart
  function update(selectedGroup) {

    console.log(selectedGroup);
    // Create new data with the selection?
    var dataFilter = data.map(function (d) { return { time: d.time, value: d[selectedGroup] } })
    var max = d3.max(data, function (d) { return +d[selectedGroup] })
    var min = d3.min(data, function (d) { return +d[selectedGroup] })

    y.domain([min, max]);

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

    dot
      .data(dataFilter)
      .transition()
      .duration(1000)
      .attr("cx", function (d) { return x(+d.time) })
      .attr("cy", function (d) { return y(+d.value) })
  }

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function (d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")
    // run the updateChart function with this selected option
    update(selectedOption)
  })

})
