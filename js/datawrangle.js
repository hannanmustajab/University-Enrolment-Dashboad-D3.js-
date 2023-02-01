d3.csv("../csv/processed/yearwise_merged.csv", function (data) {

    console.log(data);

var parsetime = d3.timeParse("%Y-%m-%d");
  data.forEach(function (d) {
    d.year = parsetime(d.year);
  });


var entries = d3.nest()
    .key(function(d){return d.year; })
    .entries(data);
    // .key(function(d){return d.year})

console.log(entries);
});
