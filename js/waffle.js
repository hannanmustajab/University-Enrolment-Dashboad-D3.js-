var chart3 = d3waffle()
  .rows(4)
  .scale(1 / 3)
  .icon("&#xf015;")
  .adjust(0.425)
  .colorscale(d3.scale.category10())
  .appearancetimes(function (d, i) {
    mod = 13;
    val = i % mod;
    return val / mod * 1500;
  })
  .height(250);

  
d3.csv("../csv/processed/income_group_count.csv", function (d) {
  return {
    name: d.incomegroup,
    value: Math.round( +d.count_percentage ),
  };
}, function (error, rows) {
  
  d3.select("#waffle-chart")
    .datum(rows)
    .call(chart3);

});
