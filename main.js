// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_RENAME = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("weather.csv").then(data => {
    const parseDate = d3.timeParse("%m/%d/%Y");

    // 2.b: ... AND TRANSFORM DATA
    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.actual_mean_temp = +d.actual_mean_temp;
    });

    const cities = ["Chicago", "Indianapolis", "Philadelphia", "Phoenix", "Charlotte", "Jacksonville"];
    const filteredData = cities.map(function(city) {
        return {
            name: city,
            values: data
                .filter(function(d) { return d.city === city; })
                .sort(function(a, b) { return d3.ascending(a.date, b.date); })
        };
    });

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // 3.a: SET SCALES FOR CHART 1
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([
            d3.min(data, function(d) { return d.actual_mean_temp; }) - 5,
            d3.max(data, function(d) { return d.actual_mean_temp; }) + 5
        ])
        .range([height, 0]);

    // 4.a: PLOT DATA FOR CHART 1
    const line = d3.line()
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.actual_mean_temp); });

    svg1_RENAME.selectAll(".line")
        .data(filteredData)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", function(d) { return color(d.name); })
        .attr("stroke-width", 2)
        .attr("d", function(d) { return line(d.values); });

    svg1_RENAME.selectAll(".legend")
        .data(filteredData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
            return "translate(" + (width + 30) + "," + (i * 20) + ")";
        })
        .each(function(d) {
            d3.select(this)
                .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 12)
                .attr("height", 12)
                .style("fill", color(d.name));

            d3.select(this)
                .append("text")
                .attr("x", 18)
                .attr("y", 10)
                .style("font-size", "12px")
                .style("fill", "#333")
                .text(function(d) { return d.name; });
        });

    // 5.a: ADD AXES FOR CHART 1
    svg1_RENAME.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg1_RENAME.append("g")
        .call(d3.axisLeft(yScale));

    // 6.a: ADD LABELS FOR CHART 1
    svg1_RENAME.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("text-anchor", "middle")
        .text("Date");

    svg1_RENAME.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .style("text-anchor", "middle")
        .text("Actual Mean Temperature (°F)");

    // 7.a: ADD INTERACTIVITY FOR CHART 1

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2

    // 4.b: PLOT DATA FOR CHART 2

    // 5.b: ADD AXES FOR CHART

    // 6.b: ADD LABELS FOR CHART 2

    // 7.b: ADD INTERACTIVITY FOR CHART 2
});