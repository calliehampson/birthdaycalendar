import * d3 from "https://cdn.jsdeliver.net/npm/d3@7/+esm"; 

const square_size = 45;
const square_radius = 5;

const square_padding = 5;
const month_padding = 20;

// 8 paddings so that there is padding on left and right
const month_width = square_size * 7 + square_padding * 8;
const month_height = square_size * 5 + square_padding * 6;
const month_columns = 4;

const month_labels = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december"
]

const csv_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQx65G1-fUll3QaSdJf2-knWIqDSKvpQ87-DZn4lZzA4f0mi1gS5sBzGOc3-JPb-QWH07GEqEPa4xbA/pub?output=csv"

// Select the container element for the chart
const svgContainer = d3.select('body')
  .append('svg')
  .attr('width', month_columns * (month_width + month_padding))
  .attr('height', Math.floor(12 / month_columns) * (month_width + month_padding));


var month_x_scale = (month) => {
  return (month % month_columns) * (month_width + month_padding);
}

var month_y_scale = (month) => {
  return Math.floor(month / month_columns) * (month_height + month_padding);
}

// build color scale
var colorScale = d3.scaleSequential()
  .interpolator(d3.interpolatePuBuGn)
  .domain([-1,6]);

// build x scale
var day_x = (day) => {
  return ((day - 1) % 7) * (square_size + square_padding);
}

var day_y = (day) => {
  return Math.floor((day - 1) / 7) * (square_size + square_padding);
}

// create a tooltip
const tooltip = d3.select('body')
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "#FFFCFB")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

// three functions that change the tooltip when user hover / move / leave a cell
var mouseover = function(event, d) {
  tooltip
    .style("opacity", 1);
  
  d3.select(this)
    .style("stroke", "white");
}

var mousemove = function(event, d){
  tooltip
    .html("I know of "+ d.n + "<br>birthdays on " + d.month + "/" + d.day)
    .style("left", (event.x + 15)+"px")
    .style("top", (event.y - 40)+"px");


  // d3.mouse(this) = [x, y]
  // d3.mouse(this)[0] = left position
  // d3.mouse(this)[1] = up position
}

var mouseleave = function(event, d){
  tooltip
    .style("opacity", 0);
  d3.select(this)
    .style("stroke", "none");
}

var apply_data = (data) => {
  // 2d array of month, day
  var nested_data = []
  for(var i = 0; i < 12; i++) {
    nested_data.push(data.filter((d) => d.month == i + 1));
  }

  // create the month squares
  var month_rects = svgContainer
    .selectAll('.month-rect')
    .data(nested_data)
    .enter()
    .append('rect')
    .attr("class", "month-rect")
    .attr('width', month_width)
    .attr('height', month_height)
    .attr('rx', square_radius)
    .attr('ry', square_radius)
    .attr('x', (_, i) => month_x_scale(i))
    .attr('y', (_, i) => month_y_scale(i))
    .style('fill', colorScale(0));
  
  
  // create the day squares
  var day_rects = svgContainer
    .selectAll('.day-rect')
    .data(nested_data)
    .enter()
    .selectAll('.day-rect')
    .data((month) => month)
    .enter()
    .append('rect')
    .attr('class', 'day-rect')
    .attr('width', square_size)
    .attr('height', square_size)
    .attr('rx', square_radius)
    .attr('ry', square_radius)
    .attr('x', (d) => month_x_scale(d.month-1) + square_padding + day_x(d.day))
    .attr('y', (d) => month_y_scale(d.month-1) + square_padding + day_y(d.day))
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("fill", function(d) { return colorScale(d.n) })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}

function refresh_data() {
  d3.csv(csv_url, (d) => {
    d.month = +d.month;
    d.day = +d.day;
    d.n = +d.n;
    return d;
  }).then(apply_data);
}

refresh_data();
setInterval(refresh_data, 10000);
