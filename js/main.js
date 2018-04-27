var n = 20, // number of layers
    m = 200, // number of samples per layer
    k = 10; // number of bumps per layer
csv = "Test.csv"

d3.csv(csv, function(data){
    console.log(data);
    data.forEach(function(d) {
      d.date = format.parse(d.Ref_Date);
      d.value = +parseInt(d.Value);
    });
});

var layers = stack(nest.entries(data));

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var x = d3.scaleLinear()
    .domain([0, m - 1])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([d3.min(layer, stackMin), d3.max(layer, stackMax)])
    .range([height, 0]);

var z = d3.interpolateCool;

var area = d3.area()
    .x(function(d, i) { return x(i); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

svg.selectAll("path")
  .data(layer)
  .enter().append("path")
    .attr("d", area)
    .attr("fill", function() { return z(Math.random()); });

function stackMax(layer) {
  return d3.max(layer, function(d) { return d[1]; });
}

function stackMin(layer) {
  return d3.min(layer, function(d) { return d[0]; });
}

// Inspired by Lee Byron’s test data generator.
function bumps(n, m) {
  var a = [], i;
  for (i = 0; i < n; ++i) a[i] = 0;
  for (i = 0; i < m; ++i) bump(a, n);
  return a;
}

function bump(a, n) {
  var x = 1 / (0.1 + Math.random()),
      y = 2 * Math.random() - 0.5,
      z = 10 / (0.1 + Math.random());
  for (var i = 0; i < n; i++) {
    var w = (i / n - y) * z;
    a[i] += x * Math.exp(-w * w);
  }
}
