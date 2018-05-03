var csv = "ModifiedData.csv"

// Tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Color selections
var colorWheel = ['#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f','#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

// Read in data
d3.csv(csv, function(error, d){
  if (error) {
    console.error('Error with data.');
    throw error;
  }

  var nestingData = d3.nest()
    .key(function(d) { return d.Year;})
    .entries(d);

  var fullData = nestingData.map(function(d) {
    var myObject = {
      Year : new Date(d.key, 0, 1)
    }
    d.values.forEach(function(v){
      myObject[v.Country] = +v.Count;
    })
    return myObject;
  })

  buildGraph(fullData);
});

function buildGraph(fullData) {
  var data = fullData;

  // Build array of countries
  var countries = Object.keys(data[0]);
  var length = countries.length;
  for(var i = 0; i < length; i++) {
    if (countries[i] == "Year") {
      countries.splice(i, 1);
    }
  }

  var stack = d3.stack()
    .keys(countries)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetWiggle);

  var series = stack(data);


  var svg = d3.select("svg"),
      margin = {top: 30, right: 100, bottom: 30, left: 100}
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;
  console.log(width, height);

  // Range and domain, min/max
  var x = d3.scaleTime()
    .domain(d3.extent(data, function(d){ return d.Year; }))
    .range([100, width]);

  var y = d3.scaleLinear()
    .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
    .range([height, 0]);

  function stackMax(series) {
    return d3.max(series, function(d) { return d[1]; });
  }

  function stackMin(series) {
    return d3.min(series, function(d) { return d[0]; });
  }

  var area = d3.area()
    .x(function(d) { return x(d.data.Year); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); })
    .curve(d3.curveBasis);

  // Build paths
  svg.selectAll("path")
    .data(series)
    .enter().append("path")
      .attr("d", area)
      .attr("class", "layer")
      .attr("fill", function (d) { return colorWheel[d.index]; })

  // Tooltips, lines, and other chart ornaments
  var line = svg.append("line")
    .style("stroke-width", 15)
    .style("stroke", "grey")
    .style("opacity", 0);

  svg.selectAll(".layer")
    .attr("opacity", 1)
    .on("mousemove", function(d, i) {
      svg.selectAll(".layer")
      .attr("opacity", function(d, j) {
        return j != i ? 0.6 : 1;
      })

      mouseYear = d3.mouse(this);
      mouseYear = mouseYear[0];
      var invertMouse = x.invert(mouseYear);

      line
        .attr("x1", x(invertMouse)-10)
        .attr("y1", 0)
        .attr("x2", x(invertMouse)-10)
        .attr("y2", height)
        .style("opacity", .3);

      var countryDisplay = d.key;
      var yearDisplay = invertMouse.getFullYear();
      var countDisplay = data[invertMouse.getFullYear()-1955][d.key];

      // Thousands
      const addCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
      countDisplay = addCommas(countDisplay);

      div
        .html("<div class='country'>" + countryDisplay + "</div><div class='year'>" + yearDisplay +  "</div><div class='count'>" + countDisplay + " Immigrants</div>")
        .style("left", (d3.event.pageX + 28) + "px")
        .style("top", (d3.event.pageY - 28) + "px");

      div.transition()
        .duration(250)
        .style("opacity", 1);
    })

  // Revert when mouse leaves
  d3.select("svg")
    .on("mouseleave", function(d,i) {
      line.transition()
        .duration(250)
        .style("opacity", 0);
      div.transition()
        .duration(250)
        .style("opacity", 0);
      svg.selectAll(".layer").transition()
        .duration(250)
        .attr("opacity", function(d, j) {
          return j != i ? 1 : .6;
        })
    })

  // Build Axes
  var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(10);

  var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(0);

  // Add the X Axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the Y Axis
  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + margin.right + ",0)")
    .call(yAxis);

  // Add the legend
  var legend = svg.append("g")
    .attr("class", "legend")
    .attr("x", width - margin.right)
    .attr("y", 0)
    .attr("heigth", 100)
    .attr("width", 100);

  // Reverse for legend
  var reverseSeries = series.reverse();
  legend.selectAll('g').data(reverseSeries)
    .enter()
    .append('g')
    .each(function(d,i) {
      var g = d3.select(this);
      g.append("rect")
          .attr("x", width + 20 )
          .attr("y", (i*20)+3)
          .attr("width", 8)
          .attr("height", 8)
          .style("fill", function (d) { return colorWheel[d.index]; });
      g.append("text")
          .attr("x", width + 35)
          .attr("y", (i*20) + 13 )
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", "black")
          .text(d.key);
    });
};
