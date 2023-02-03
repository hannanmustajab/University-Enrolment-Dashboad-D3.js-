
function d3waffle() {
  var margin = { top: 10, right: 10, bottom: 10, left: 10 },
    icon = "&#9632;",
    scale = 0.5,
    rows = 10,
    adjust = 0.8,
    colorscale = d3.scaleOrdinal(d3.schemeCategory20),
    appearancetimes = function (d, i) { return 500; },
    height = 200,
    magic_padding = 5;

  function chart(selection) {
    // console.log(selection);

    selection.each(function (data) {

      selection.selectAll("*").remove();


      /* setting parameters and data */
      var idcontainer = "waffle-chart"; // I need to change thiz plz
      var total = d3.sum(data, function (d) { return d.value; });

      /* updating data */
      data.forEach(function (d, i) {
        data[i].class = slugify(d.name);
        data[i].scalevalue = Math.round(data[i].value * scale);
        data[i].percent = data[i].value / total;
      });

      var totalscales = d3.sum(data, function (d) { return d.scalevalue; })
      var cols = Math.ceil(totalscales / rows);
      var griddata = cartesianprod(d3.range(cols), d3.range(rows));
      var detaildata = [];

      data.forEach(function (d) {
        d3.range(d.scalevalue).forEach(function (e) {
          detaildata.push({ name: d.name, class: d.class })
        });
      });

      detaildata.forEach(function (d, i) {
        detaildata[i].col = griddata[i][0];
        detaildata[i].row = griddata[i][1];
      })


      var gridSize = ((height - margin.top - margin.bottom) / rows)

      /* setting the container */
      var svg = selection.append("svg")
        .attr("width", "100%")
        .attr("height", height + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("cursor", "default");

      var tooltip = d3.select("body")
        .append("div")
        .attr("class", "waffle-tooltip")
        .style("position", "absolute")
        .style("text-align", "right")
        .style("background", "#333")
        .style("margin", "3px")
        .style("color", "white")
        .style("padding", "3px")
        .style("border", "0px")
        .style("border-radius", "3px") // 3px rule
        .style("opacity", 0)
        .style("cursor", "default");

      var nodes = svg.selectAll(".node")
        .data(detaildata)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + (d.col) * gridSize + "," + (rows - d.row - 1) * gridSize + ")"; });

      /* this is necesary, when the icons are small/thin activate mouseout */
      nodes.append("text")
        .style("opacity", 0)
        .html(icon)
        .attr('class', function (d) { return d.class; })
        .attr('font-family', 'FontAwesome')
        .attr("transform", function (d) { return "translate(" + gridSize / 2 + "," + 5 / 6 * gridSize + ")"; })
        .style("text-anchor", "middle")
        .style('fill', function (d) { return colorscale(d.class); })
        .style("font-size", function (d) {
          val = 9;
          val2 = 2.5;
          textsize = Math.min(val2 * gridSize, (val2 * gridSize - val) / this.getComputedTextLength() * val);
          return textsize * adjust + "px";
        })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .transition()
        .duration(appearancetimes)
        .style("opacity", 1);

      nodes.append("rect")
        .style("fill", "white")
        .attr('class', function (d) { return d.class; })
        .style("stroke", "gray")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .style("opacity", 0)

      var legend = svg.selectAll('.legend')
        .data(data)
        .enter().append('g')
        .attr('class', function (d) { return "legend" + " " + d.class; })
        .attr("transform", function (d) { return "translate(" + (cols * gridSize + magic_padding) + "," + magic_padding + ")"; })

      legend.append('text')
        .attr('x', gridSize)
        .attr('y', function (d, i) { return i * gridSize + i * magic_padding / 2; })
        .style("opacity", 1)
        .html(function (d) { return icon; })
        .attr('class', function (d) { return d.class; })
        .attr('font-family', 'FontAwesome')
        .attr("transform", function (d) { return "translate(" + gridSize / 2 + "," + 5 / 6 * gridSize + ")"; })
        .style('fill', function (d) { return colorscale(d.class); })
      /*.style("font-size", function(d) {
        val = 9;
        val2 = 2.5;
        textsize = Math.min(val2 * gridSize, (val2 * gridSize - val) / this.getComputedTextLength() * val);
        return textsize * adjust + "px";
      });*/

      legend.append('text')
        .attr('x', 1.5 * gridSize + magic_padding)
        .attr('y', function (d, i) { return i * gridSize + i * magic_padding / 2; })
        .style("opacity", 1)
        .html(function (d) { return d.name; })
        .attr('class', function (d) { return "waffle-legend-text" + " " + d.class; })
        .attr("transform", function (d) { return "translate(" + gridSize / 2 + "," + 5 / 6 * gridSize + ")"; })

      function mouseover(d) {
        tooltip.transition().duration(100).style("opacity", .9);
        el = data.filter(function (e) { return e.name == d.name })[0]
        txt = "<b>" + el.name + "</b>" + "<br>(" + d3.format(".0%")(el.percent) + ")"
        tooltip.html(txt);

        d3.select("#" + idcontainer).selectAll("text").transition().duration(100).style("opacity", 0.2);
        d3.select("#" + idcontainer).selectAll("text." + d.class).transition().duration(100).style("opacity", 1);
      }

      function mouseout(d) {
        tooltip.transition().duration(100).style("opacity", 0);
        d3.select("#" + idcontainer).selectAll("text").transition().duration(100).style("opacity", 1);
      }

      function mousemove(d) {
        tooltip
          .style("left", (d3.event.pageX + 0) + "px")
          .style("top", (d3.event.pageY + - 70) + "px");
      }

    });
  }

  chart.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.rows = function (_) {
    if (!arguments.length) return rows;
    rows = _;
    return chart;
  };

  chart.icon = function (_) {
    if (!arguments.length) return icon;
    icon = _;
    return chart;
  };

  chart.scale = function (_) {
    if (!arguments.length) return scale;
    scale = _;
    return chart;
  };

  chart.colorscale = function (_) {
    if (!arguments.length) return colorscale;
    colorscale = _;
    return chart;
  };

  chart.appearancetimes = function (_) {
    if (!arguments.length) return appearancetimes;
    appearancetimes = _;
    return chart;
  };

  chart.adjust = function (_) {
    if (!arguments.length) return adjust;
    adjust = _;
    return chart;
  };

  return chart;

}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .trim();                        // Trim - from end of text
}

/* http://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript */
function cartesianprod(paramArray) {

  function addTo(curr, args) {

    var i, copy,
      rest = args.slice(1),
      last = !rest.length,
      result = [];

    for (i = 0; i < args[0].length; i++) {

      copy = curr.slice();
      copy.push(args[0][i]);

      if (last) {
        result.push(copy);

      } else {
        result = result.concat(addTo(copy, rest));
      }
    }

    return result;
  }


  return addTo([], Array.prototype.slice.call(arguments));
}


// ==============================================================================
// ====================================================================================


var chart4 = d3waffle()
  .rows(5)
  .scale(1/3)
  .icon("&#xf19d;")
  .adjust(0.4)
  .colorscale(d3.scaleOrdinal(d3.schemeCategory10))
  .appearancetimes(function (d, i) {
    mod = 13;
    val = i % mod;
    return val / mod * 1500;
  });
  // .height(200);

function filterData(data, country) {

  // Get dataset
  var groupedData = d3.nest()
    .key(function (d) { return d.Country; })
    .entries(data);

  // filter it.
  const filteredLog = groupedData.find(item => item.key === country).values;

  const newArray = filteredLog.map(obj => {
    return [
      { name: "Bachelor's", value: +obj.percent_bachelor },
      { name: "Master's", value: +obj.percent_masters },
      { name: "PhD", value: +obj.percent_phd },
    ];
  });
  return newArray[0];
}


var width = 700,
  height = 400;

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

var selectedCountry;
svg.call(zoom);

var map = svg.append("g")
  .attr("class", "map");
var tooltip = d3.select("div.tooltip");

d3.queue()
d3.queue()
  .defer(d3.json, "js/50m.json")
  .defer(d3.csv, "../csv/processed/merged_dataset.csv")
  .await(function (error, world, data) {
    if (error) {
      console.error('Oh dear, something went wrong: ' + error);
    } else {
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
        let private01 = +d.private01 ? "Private" : "Public";

    populationById[d.countrycode] = {
      university: d.University,
      private: +d.Private,
      public: +d.Public,
      count: +d.total_students,
      year: d.founded_in,
      private_p: private_percentage,
      public_p: public_percentage,
      uni_status: private01,
      founded_year: d.founded_in,
      total_uni: d.total_universities
    }
  });

  features.forEach(function (d) {
    d.details = populationById[d.id] ? populationById[d.id] : {};
  });

    console.log(data);

    // Add circles to map

    map.append("g")
        .selectAll("path")
        .data(features)
        .enter().append("path")
        .attr("name", function (d) {
            return d.properties.name;
        })
        .attr("id", function (d) {
            return d.properties.name;
        })
        .attr("d", path)
        .style("fill", function (d) {
            return d.details && d.details.count ? color(d.details.count) : undefined;
        })
        .attr("fill", "white")
        .attr("d", path)
        .on("mouseover", function (d, i) {
            d3.select(this).attr("fill", "grey").attr("stroke-width", 2);
            return tooltip.style("hidden", false).html(d.properties.name);
        })
        .on("mousemove", function (d) {
            tooltip.classed("hidden", false)
                .style("left", (d3.mouse(this)[0] - 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                .style("top", (d3.mouse(this)[1]) + "px")
                .html(d.properties.name);
        })
        .on('click', function (d) {
            d3.select(this)
                .style("stroke", "white")
                .style("stroke-width", 1)
                .style("cursor", "pointer");

            d3.selectAll(".Country")
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
        .text('Private');

      d3.select("#university-type")
        .text(d.details.uni_status)

      d3.select("#founded_year")
        .text(d.details.founded_year);

      d3.select("#public_uni_progressbar")
        .style("width", d3.format(".2s")(d.details.public_p) + '%')
        .text('Public')

      d3.select(".year")
        .text(d.details.year);

      d3.select('.details')
        .style('visibility', "visible")

      d3.select('.total-universities')
        .text(d.details.total_uni)

      d3.select("#waffle-chart-2")
        .datum(filterData(data, d.properties.name))
        .call(chart4);

      // d3.select("#bachelors_count")
      // .text(Math.round((filterData(data,d.properties.name)[0].value)%10))

      // console.log(((filterData(data,d.properties.name))));


      d3.selectAll(".hover-on-map")
        .style("display", "none")
      // .text('')

    })
    .on('mouseout', function (d) {
      d3.select(this)
        .style("stroke", null)
        .style("stroke-width", 0.25);

      d3.select('.details')
        .style('visibility', "hidden");
    });
}