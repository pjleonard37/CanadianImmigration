var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var stack = d3.stack().keys(d3.range(10)).offset(d3.stackOffsetWiggle), layer = stack(d3.transpose(d3.range(20).map(function() {return 10; })));

svg.selectAll("path").data(stack);
