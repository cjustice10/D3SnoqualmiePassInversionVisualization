var margin = {top: 30, right: 20, bottom: 30, left: 50},
	width = 1800 - margin.left - margin.right,
	height = 400 - margin.top - margin.bottom;

var parseDate = d3.time.format("%m/%d/%Y %H:%M").parse,
	bisectDate = d3.bisector(function(d) { return d.date; }).left; //added

var x = d3.time.scale().range([0, width]);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x)
	.orient("bottom").ticks(25);

var yAxis = d3.svg.axis().scale(y)
	.orient("left").ticks(5);

var area = d3.svg.area()
	.x(function(d) { return x(d.date); })
	.y0(height)
	.y1(function(d) { return y(d.SnoqualmieBase); });

var area2 = d3.svg.area()
	.x(function(d) { return x(d.date); })
	.y0(height)
	.y1(function(d) { return y(d.SnoqualmieSummit); });

var valueline = d3.svg.line()
	.x(function(d) { return x(d.date); })
	.y(function(d) { return y(d.SnoqualmieBase); });

var valueline2 = d3.svg.line()
	.x(function(d) { return x(d.date); })
	.y(function(d) { return y(d.SnoqualmieSummit); });	

var svg = d3.select("body")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform",
		"translate(" + margin.left + "," + margin.top + ")");

var minDate = new Date(-86400000000);
console.log(minDate);

var maxDate = new Date(10000000000000);
console.log(maxDate);

// Get the data
d3.csv("Temperatures.csv", function(error, data) {
	data.forEach(function(d) {
		d.date = parseDate(d.date);
		d.SnoqualmieBase = +d.SnoqualmieBase;
		d.SnoqualmieSummit = +d.SnoqualmieSummit;
  		});

	data = data.filter(function (d) {
		console.log(d.date);
		console.log(d.date > minDate);
		console.log(d.date < maxDate);
		console.log((d.date > minDate) && (d.date < maxDate));
		return ((d.date > minDate) && (d.date < maxDate));
	});	 

	data.sort(function(a, b) {
    	return a.date - b.date;
  	});

	// Scale the range of the data
	x.domain(d3.extent(data, function(d) { 
		return d.date; }));

	y.domain([d3.min(data, function(d) {
				return Math.min(d.SnoqualmieBase, d.SnoqualmieSummit); }), d3.max(data, function(d) {
				return Math.max(d.SnoqualmieBase, d.SnoqualmieSummit); })]);

	svg.append("path") // Add the valueline path.
		.attr("class", "line")
		.attr("d", valueline(data));

	svg.append("path") // Add the valueline path.
		.attr("class", "line2")
		.attr("d", valueline2(data));

	svg.append("path")
		.data([data])
		.attr("class", "area2")
		.attr("d", area2);

	svg.append("path")
		.data([data])
		.attr("class", "area")
		.attr("d", area);

	svg.append("rect")
		.attr("class", "rect1")
		.attr("x", -50)
		.attr("y", 0)
		.attr("width", 50)
		.attr("height", 360);

	svg.append("rect")
		.attr("class", "rect2")
		.attr("x", 1730)
		.attr("y", 0)
		.attr("width", 50)
		.attr("height", 400);

	svg.append("g") // Add the X Axis
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg.append("text") // text label for the x axis
		.attr("transform",
			"translate(" + (width/2) + " ," +
			(height+margin.bottom) + ")")
		.style("text-anchor", "middle")
		.text("Date");

	svg.append("g") // Add the Y Axis
		.attr("class", "y axis")
		.call(yAxis);

	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left*3)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Temperature (F)");

	var focus1 = svg.append("g")
	    .attr("class", "focus")
	    .style("display", "none");

	var focus2 = svg.append("g")
	    .attr("class", "focus")
	    .style("display", "none");

	focus1.append("circle")
	    .attr("r", 4.5);

	focus2.append("circle")
	 	.attr("r", 4.5);

	focus1.append("text")
	    .attr("x", 9)
	    .attr("dy", ".35em");

	focus2.append("text")
	    .attr("x", 9)
	    .attr("dy", ".35em");

	svg.append("rect")
	    .attr("class", "overlay")
	    .attr("width", width)
	    .attr("height", height)
	    .on("mouseover", function() { focus1.style("display", null); focus2.style("display", null);})
	    .on("mouseout", function() { focus1.style("display", "none"); focus2.style("display", "none");})
	    .on("mousemove", mousemove);

	function mousemove() {
	    var x0 = x.invert(d3.mouse(this)[0]),
	        i = bisectDate(data, x0, 1),
	        d0 = data[i - 1],
	        d1 = data[i],
	        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
	    focus1.attr("transform", "translate(" + x(d.date) + "," + y(d.SnoqualmieBase) + ")");
	    focus1.select("text").text(d.SnoqualmieBase + "º F");
	    focus2.attr("transform", "translate(" + x(d.date) + "," + y(d.SnoqualmieSummit) + ")");
	    focus2.select("text").text(d.SnoqualmieSummit + "º F");
	}

	// Set date option
	$("#dateSlider").dateRangeSlider({
 		bounds:{
	    	min: new Date(2014, 10, 18),
	    	max: new Date(2014, 11, 31)  
 		}, defaultValues:{
	    	min: new Date(2014, 10, 18),
	    	max: new Date(2014, 11, 31)  
 		}
 	});

	$("#dateSlider").bind("valuesChanged", function(e, data) {
  		console.log("Values just changed. min: " + data.values.min + " max: " + data.values.max);
  		minDate = data.values.min;
  		maxDate = data.values.max;
  		updateData();
	});

	function updateData() {
		d3.csv("Temperatures.csv", function(error, data) {
			data.forEach(function(d) {
				d.date = parseDate(d.date);
				d.SnoqualmieBase = +d.SnoqualmieBase;
				d.SnoqualmieSummit = +d.SnoqualmieSummit;
  			});

			data = data.filter(function (d) {
				console.log(d.date);
				console.log(d.date > minDate);
				console.log(d.date < maxDate);
				console.log((d.date > minDate) && (d.date < maxDate));
				return ((d.date > minDate) && (d.date < maxDate));
			});	 

			data.sort(function(a, b) {
		    	return a.date - b.date;
		  	});

			// Scale the range of the data
			x.domain(d3.extent(data, function(d) { 
				return d.date; }));

			y.domain([d3.min(data, function(d) {
					return Math.min(d.SnoqualmieBase, d.SnoqualmieSummit); }), 
				d3.max(data, function(d) {
					return Math.max(d.SnoqualmieBase, d.SnoqualmieSummit); })]);

			var svg = d3.select("body").transition();

	        svg.select(".line")   // change the line
	            .duration(750)
	            .attr("d", valueline(data));

	        svg.select(".line2")   // change the line
	            .duration(750)
	            .attr("d", valueline2(data));

	        svg.select(".area")   // change the area
	            .duration(750)
	            .attr("d", area);    

	        svg.select(".area2")   // change the area
	            .duration(750)
	            .attr("d", area2);  

	        svg.select(".rect1")
	        	.duration(750);

	        svg.select(".rect2")
	        	.duration(750);

	        svg.select(".x.axis") // change the x axis
	            .duration(750)
	            .call(xAxis);

	        svg.select(".y.axis") // change the y axis
	            .duration(750)
	            .call(yAxis);
			})};
});




