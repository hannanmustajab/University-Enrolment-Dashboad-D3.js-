
var width = 600,
    height = 200;

var svg = d3.select(".bubble2")
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


var tooltip = d3.select("div.tooltip");


d3.queue()
d3.queue()
    .defer(d3.json, "js/50m.json")
    .defer(d3.csv, "../csv/processed/privatepublicheatmap.csv")
    .await(function (error, world, data) {
        if (error) {
            console.error('Oh dear, something went wrong: ' + error);
        } else {
            console.log(data);
            drawMap(world, data);
        }
    });


function drawMap(world, data) {

    // geoMercator projection
    var projection = d3.geoMercator() //d3.geoOrthographic()
        .scale(50)
        .scale(100)
        .translate([width / 2, height / 1.5]);

    // geoPath projection
    var path = d3.geoPath().projection(projection);

    var features = topojson.feature(world, world.objects.countries).features;


    data.forEach(function (d) {
        d.latitude = +d.latitude,
            d.longitude = +d.longitude,
            d.Foundedin = +d.Foundedin,
            d.private01 = +d.private01
    });


    for (var i = 0; i < data.length; i++) {
        if (data[i].private01) {
            data[i].private = true;
            data[i].public = false;
        } else {
            data[i].private = false;
            data[i].public = true;
        }
    }


    // Draw map

    map.append("g")
        .selectAll("path")
        .data(features)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        .attr("d", path)
        .style("stroke", "#fff")
        .attr("fill", "grey")
        .attr("opacity", 0.5)
        .append("text")


    // Scale for this
    var nMinMax = d3.extent(data, function (d) { return +d.Foundedin })

    ntoRadius = d3.scaleSqrt()
        .domain([2020, 962])
        .range([1, 10])

    var scaleMap = d3
        .scaleOrdinal()
        .domain(['true', 'false'])
        .range(d3.schemeCategory10);


    // create a tooltip
    var Tooltip = d3.select(".bubble2")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")


    // console.log(nMinMax);
    map
        .selectAll("myCircles")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", 'private' + function (d) { return d.public })
        .attr("cx", function (eachCircle) {
            return projection([eachCircle.longitude, eachCircle.latitude])[0];
        })
        .attr("cy", function (eachCircle) {
            return projection([eachCircle.longitude, eachCircle.latitude])[1];
        })
        .attr("r",1)
        .style("fill", function (d) { if (d.private) return "blue"; else if (d.public) return "yellow"; })
        .attr("stroke", "white")
        .attr("stroke-width", "0.1")
        .attr("fill-opacity", "0.5")



    // This function is gonna change the opacity and size of selected and unselected circles
    function update() {
        // For each check box:
        d3.selectAll(".checkbox").each(function (d) {
            cb = d3.select(this);
            grp = cb.property("value")

            // If the box is check, I show the group
            if (cb.property("checked")) {
                map.selectAll("." + grp).style("opacity", 1).attr("r", 1)

                // Otherwise I hide it
            } else {
                map.selectAll("." + grp).style("opacity", 0).attr("r", 0)
            }
        })
    }

    // When a button change, I run the update function
    d3.selectAll(".checkbox").on("change", update);

    // And I initialize it at the beginning
    update()


}