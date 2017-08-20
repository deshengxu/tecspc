generateNormalHistogram = function(mean, stdev, binSize, sampleSize) {
  var cwidth = 500, cheight = 280;
  var margin = {top: 20, right: 10, bottom: 20, left: 50};
  
  var el = new NxSheet.GridView({
    id: 'normal-distribution-chart', 
    className: 'normal-distribution-chart',
    pos: {x: 20, y: 200}, 
    css: {width: cwidth + margin.left + margin.right, height: cheight + margin.top + margin.bottom},
    draggable: true,
    clear: true
  });
  
  //setting up empty data array
  var data = [];
  
  getData(); // popuate data 
  
  // line chart based on http://bl.ocks.org/mbostock/3883245
  var width = cwidth - margin.left - margin.right,
      height = cheight - margin.top - margin.bottom;
  
  var xScale = d3.scale.ordinal()
      .rangeRoundBands([0, width], 0.1);
  
  var y = d3.scale.linear()
      .range([height, 0]);
  
  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom");
  
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");
  
  var svg = d3.select("#normal-distribution-chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  xScale.domain(data.map(function(d) {
      return d.q;
  }));
  
  y.domain(d3.extent(data, function(d) {
      return d.p;
  }));
  
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
  
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
  
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return xScale(d.q); })
      .attr("width", xScale.rangeBand())
      .attr("y", function(d) { return y(d.p); })
      .attr("height", function(d) { return height - y(d.p); });
  
  function getData() {
    var i;
    var xRandom = dl.random.normal(mean, stdev);
    
    var binNum = binSize, valNum = sampleSize;
    var rValues = xRandom.samples(valNum), bins = [];
    
    for (i = 0; i < binNum; i++) {
      bins.push(0);
    }
    
    var rRange = d3.extent(rValues, function(d) {
      return d;
    });
    
    for (i = 0; i < valNum; i++) {
      var bin = Math.floor((rValues[i] - rRange[0]) / ((rRange[1] - rRange[0]) / (binNum - 1)));
      
      bins[bin] += 1;
    }
    
    var binInterval = ((rRange[1] - rRange[0]) / (binNum - 1));
    for (i = 0; i < binNum; i++) {
      data.push({q: Math.round((binInterval * i + rRange[0]) * 10) / 10, p: bins[i]});
    }
  }
  
  return true;
}