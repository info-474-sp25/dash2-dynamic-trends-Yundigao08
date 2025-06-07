// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers
const svg1_RENAME = d3.select("#lineChart1")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let xScale, yScale;
let globalData;
const color = d3.scaleOrdinal(d3.schemeCategory10);

d3.csv("weather.csv").then(data => {
    const parseDate = d3.timeParse("%m/%d/%Y");
    data.forEach(d => {
        d.date = parseDate(d.date);
        d.actual_mean_temp = +d.actual_mean_temp;
    });

    globalData = data;

    const minDate = d3.min(data, d => d.date);
    const maxDate = d3.max(data, d => d.date);
    const cities = ["Chicago", "Indianapolis", "Philadelphia", "Phoenix", "Charlotte", "Jacksonville"];

    const filteredData = cities.map(city => ({
        name: city,
        values: data.filter(d => d.city === city).sort((a, b) => d3.ascending(a.date, b.date))
    }));

    xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    yScale = d3.scaleLinear()
        .domain([
            d3.min(data, d => d.actual_mean_temp) - 5,
            d3.max(data, d => d.actual_mean_temp) + 5
        ])
        .range([height, 0]);

    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.actual_mean_temp));

    svg1_RENAME.selectAll(".line")
        .data(filteredData)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", d => color(d.name))
        .attr("stroke-width", 2)
        .attr("d", d => line(d.values));

    svg1_RENAME.selectAll(".legend")
        .data(filteredData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 30},${i * 20})`)
        .each(function(d) {
            d3.select(this)
                .append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .style("fill", color(d.name));
            d3.select(this)
                .append("text")
                .attr("x", 18)
                .attr("y", 10)
                .style("font-size", "12px")
                .style("fill", "#333")
                .text(d.name);
        });

    svg1_RENAME.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg1_RENAME.append("g")
        .call(d3.axisLeft(yScale));

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

    const slider = document.getElementById("dateSlider");
    const sliderLabel = document.getElementById("sliderValueLabel");
    const totalDays = d3.timeDay.count(minDate, maxDate);
    slider.max = totalDays;

    slider.addEventListener("input", () => {
        const offset = +slider.value;
        const selectedDate = d3.timeDay.offset(minDate, offset);
        sliderLabel.textContent = `Starting from: ${d3.timeFormat("%B %d, %Y")(selectedDate)}`;
        updateChart(selectedDate);
    });

    document.getElementById("citySelector").addEventListener("change", () => {
        const offset = +slider.value;
        const selectedDate = d3.timeDay.offset(minDate, offset);
        updateChart(selectedDate);
    });
});

function updateChart(startDate) {
    const dropdownValue = document.getElementById('citySelector').value;

    svg1_RENAME.selectAll(".line").remove();
    svg1_RENAME.selectAll(".legend").remove();

    let lineGenerator = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.actual_mean_temp));

    if (dropdownValue) {
        const filtered = globalData
            .filter(d => d.city === dropdownValue && d.date >= startDate)
            .sort((a, b) => d3.ascending(a.date, b.date));

        svg1_RENAME.append("path")
            .datum(filtered)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", color(dropdownValue))
            .attr("stroke-width", 2)
            .attr("d", lineGenerator);

        svg1_RENAME.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width + 30}, 0)`)
            .append("text")
            .text(dropdownValue)
            .style("fill", color(dropdownValue))
            .attr("x", 0)
            .attr("y", 10)
            .style("font-size", "12px");

    } else {
        const cities = ["Chicago", "Indianapolis", "Philadelphia", "Phoenix", "Charlotte", "Jacksonville"];
        const filteredData = cities.map(cityName => ({
            name: cityName,
            values: globalData
                .filter(d => d.city === cityName && d.date >= startDate)
                .sort((a, b) => d3.ascending(a.date, b.date))
        }));

        svg1_RENAME.selectAll(".line")
            .data(filteredData)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", d => color(d.name))
            .attr("stroke-width", 2)
            .attr("d", d => lineGenerator(d.values));

        svg1_RENAME.selectAll(".legend")
            .data(filteredData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width + 30},${i * 20})`)
            .each(function(d) {
                d3.select(this)
                    .append("rect")
                    .attr("width", 12)
                    .attr("height", 12)
                    .style("fill", color(d.name));
                d3.select(this)
                    .append("text")
                    .attr("x", 18)
                    .attr("y", 10)
                    .style("font-size", "12px")
                    .style("fill", "#333")
                    .text(d.name);
            });
    }
}
