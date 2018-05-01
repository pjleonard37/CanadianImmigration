csv = "ModifiedData.csv"

// Tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

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
      }
    });
  });


  var n = data.length - 1, // number of countries
      m = data.columns.length - 1, // number of observations
      i = -1;
  var firstyear = Object.keys(data[0])[0];
  var lastyear = Object.keys(data[0])[m-1];

  var stack = d3.stack().keys(d3.range(n)).offset(d3.stackOffsetWiggle),
      layers = stack(d3.transpose(d3.range(n).map(function() { return layerBuilder(n, data); })));
  var svg = d3.select("svg"),
      margin = {top: 30, right: 30, bottom: 30, left: 30}
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  var x = d3.scaleLinear()
      .domain([0, m - 1])
      .range([0, width])

  var y = d3.scaleLinear()
      .domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])
      .range([height, 0]);

  var z = d3.interpolateCool;

  var area = d3.area()
      .x(function(d, i) { return x(i); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); });

  svg.selectAll("path")
    .data(layers)
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
    })
    div.transition()
      .duration(250)
      .style("opacity", 1);

    //console.log(data[d.index]);
    div	.html(data[i]["Country"])

    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
  })

  function stackMax(layers) {
    return d3.max(layers, function(d) { return d[1]; });
  }

  function stackMin(layers) {
    return d3.min(layers, function(d) { return d[0]; });
  }

  function layerBuilder(n, data) {
    i++;
    var toReturn = Object.values(data[i]);
    delete toReturn[m];
    return Object.values(toReturn);
  }

  var xAxis = d3.axisBottom()
      .scale(x)
      .ticks(10);

  var yAxis = d3.axisLeft()
      .scale(y)
      .ticks(5);

  // Add the X Axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // Add the Y Axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
});
