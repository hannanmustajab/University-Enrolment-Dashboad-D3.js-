
var width = 600,
    height = 200;

var newmapsvg = d3.select("#newmap")
    .append("svg")
    .style("cursor", "move");

    newmapsvg.attr("viewBox", "50 10 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMin");

var zoom = d3.zoom()
    .on("zoom", function () {
        var transform = d3.zoomTransform(this);
        map.attr("transform", transform);
    });

    newmapsvg.call(zoom);

var newmap = newmapsvg.append("g")
    .attr("class", "newmap");


var tooltip = d3.select("div.tooltip");


d3.queue()
d3.queue()
    .defer(d3.json, "js/50m.json")
    .defer(d3.csv, "js/csv/processed/university_merged.csv")
    .await(function (error, world, data) {
        if (error) {
            console.error('Oh dear, something went wrong: ' + error);
        } else {
            drawNewMap(world, data);
        }
    });


function drawNewMap(world, data) {

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

    newmap.append("g")
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
        .attr("class", "country-label")
        .attr("transform", function (d) { return "translate(" + path.centroid(d) + ")"; })
        .text(function (d) { return d.properties.name; })
        .attr("dx", function (d) {
            return "0.3em";

        })
        .attr("dy", function (d) {
            return "0.35em";
        })
        .style('fill', 'black');


    // Scale for this
    var nMinMax = d3.extent(data, function (d) { return +d.Foundedin })

    ntoRadius = d3.scaleSqrt()
        .domain([2020, 962])
        .range([1, 10])

    var scaleMap = d3
        .scaleOrdinal()
        .domain(['Upper middle income', 'High income', 'Lower middle income', 'Low income'])
        .range(d3.schemeCategory10);

    // Add one dot in the legend for each name.
    var size = 1000
    newmap.selectAll("mydots")
        .data(['Upper middle income', 'High income', 'Lower middle income', 'Low income'])
        .enter()
        .append("rect")
        .attr("x", 55)
        .attr("y", function (d, i) { return 250 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) { return scaleMap(d) })

    // Add one dot in the legend for each name.
    newmap.selectAll("mylabels")
        .data(['Upper Middle income', 'High Income', 'Lower middle income', 'Low income'])
        .enter()
        .append("text")
        .attr("x", 55 + size)
        .attr("y", function (d, i) { return 250 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) { return scaleMap(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", "8px")
    // create a tooltip
    var Tooltip = d3.select("#newmap")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")



    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        Tooltip.style("opacity", 1)
    }
    var mousemove = function (d) {
        Tooltip
            .html(d.University + "<br>" + "Group: " + d.incomegroup)
            .style("left", (d3.mouse(this)[0] + 10) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function (d) {
        Tooltip.style("opacity", 0)
    }

    // console.log(nMinMax);
    newmap
        .selectAll("myCircles")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", function (d) { return d.incomegroup.replace(/\s+/g, '') })
        .attr("cx", function (eachCircle) {
            return projection([eachCircle.longitude, eachCircle.latitude])[0];
        })
        .attr("cy", function (eachCircle) {
            return projection([eachCircle.longitude, eachCircle.latitude])[1];
        })
        .attr("r", 0.5)
        .style("fill", function (d) { return scaleMap(d.incomegroup) })
        .attr("stroke", function (d) { return scaleMap(d.incomegroup) })
        .attr("stroke-width", "0.1")
        .attr("fill-opacity", "0.3")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        
    
    // // // Add pvt / public 
    // map
    // .selectAll("myCircles")
    // .data(data)
    // .enter()
    // .append("circle")
    //     .attr("class" , function(d){ return d.public })
    //     .attr("cx", function (eachCircle) {
    //         return projection([eachCircle.longitude, eachCircle.latitude])[0];
    //     })
    //     .attr("cy", function (eachCircle) {
    //         return projection([eachCircle.longitude, eachCircle.latitude])[1];
    //     })
    //     .attr("r", 2)
    //     .style("fill", function(d){if (d.private) return "purple"; else if(d.public) return "yellow"; })
    //     .attr("stroke", "white")
    //     .attr("stroke-width", "0.1")
        // .attr("fill-opacity", "0.2")
    //     .on("mouseover", mouseover)
    //     .on("mousemove", mousemove)
    //     .on("mouseleave", mouseleave)

    // This function is gonna change the opacity and size of selected and unselected circles
    function update() {
        // For each check box:
        d3.selectAll(".checkbox").each(function (d) {
            cb = d3.select(this);
            grp = cb.property("value")

            // If the box is check, I show the group
            if (cb.property("checked")) {
                newmap.selectAll("." + grp).style("opacity", 1).attr("r", 1)

                // Otherwise I hide it
            } else {
                newmap.selectAll("." + grp).style("opacity", 0).attr("r", 0)
            }
        })
    }

    // When a button change, I run the update function
    d3.selectAll(".checkbox").on("change", update);

    // And I initialize it at the beginning
    update()


}