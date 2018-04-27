csv = "ModifiedData.csv"

d3.csv(csv, function(error, data){
  if (error) {
    console.error('Error with data.');
    throw error;
  }
  data.forEach(function(d) {
    Object.keys(d).forEach(function(key) {
      if (key != "Country") {
        key = +key;
        d[key] = +d[key];
      } else {
        delete d[key];
      }
    });

  });
  var n = data.length - 1, // number of countries
      m = data.columns.length - 1, // number of observations
      i = -1;

  var stack = d3.stack().keys(d3.range(n)).offset(d3.stackOffsetWiggle),
      layers0 = stack(d3.transpose(d3.range(n).map(function() { return layerBuilder(n, data); })));

  var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

  var x = d3.scaleLinear()
      .domain([0, m - 1])
      .range([0, width]);

  var y = d3.scaleLinear()
      .domain([d3.min(layers0, stackMin), d3.max(layers0, stackMax)])
      .range([height, 0]);

  var z = d3.interpolateCool;

  var area = d3.area()
      .x(function(d, i) { return x(i); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); });

  svg.selectAll("path")
    .data(layers0)
    .enter().append("path")
      .attr("d", area)
      .attr("class", "layer")
      .attr("fill", function() { return z(Math.random()); });

  svg.selectAll(".layer")
  .attr("opacity", 1)
  .on("mouseover", function(d, i) {
    svg.selectAll(".layer").transition()
    .duration(250)
    .attr("opacity", function(d, j) {
      return j != i ? 0.6 : 1;
  })})

  function stackMax(layers0) {
    return d3.max(layers0, function(d) { return d[1]; });
  }

  function stackMin(layers0) {
    return d3.min(layers0, function(d) { return d[0]; });
  }

  function layerBuilder(n, data) {
    i++;
    return Object.values(data[i]);
  }
});
