// Function to compute the product of p1 and p2
function myFunction(data) {
    console.log(data);
    const private_uni = { name: 'private', count: data.details.private_p };
    const public_uni = { name: 'public', count: data.details.public_p };
    // d3.select('#waffle_country')


}

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
console.log('hello');
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
        .scale(100)
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

    console.log(data);
    console.log(populationById);

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

            var CountryCard = d.properties.name;

            d3.select(".CountryCard")
                .text(CountryCard);

            d3.select(".name_country")
                .text("Name: " + d.properties.name);

            d3.select(".oldest_university")
                .text("Oldest University: " + d.details.university);

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
                .style("width", d3.format(".2s")(d.details.private_p) + '%');

            d3.select(".year")
                .text("Founded Year: " + (d.details.year));

            d3.select('.details')
                .style('visibility', "visible")

            myFunction(d);



        })
        .on('mouseout', function (d) {
            d3.select(this)
                .style("stroke", null)
                .style("stroke-width", 0.25);

            d3.select('.details')
                .style('visibility', "hidden");
        });
}