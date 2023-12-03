// D3 Library for Data Visualization Scatter Plot
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"

const height = 800
const width = 1200

let padding = {
    top: 100,
    right: 70,
    bottom: 20,
    left: 70,
}
let doping = "#618B48",
    nonDoping = "#81C15C",
    text = "white",
    tool = "#9c82ad"

let color = d3.scaleOrdinal()
    .domain(["doping", "nonDoping"])
    .range([doping, nonDoping])


const tooltip = d3.select("#visualHolder")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", "0")
    .style("color", text)

const svgContainer = d3.select("#visualHolder")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .attr("color", text)

const title = svgContainer.append('g').attr("id", "title")
    .attr("height", "75")
    .attr("width", width)
    .attr("transform", `translate(${width / 2},${height / 20})`)
    .style("fill", text)

title
    .append('text')
    .attr("text-anchor", "middle")
    .attr("font-size", "2rem")
    .text("Doping in Professional Bicycle Racing")
title
    .append('text')
    .attr("text-anchor", "middle")
    .attr("id", "sub-title")
    .attr("font-size", "1.5rem")
    .text("35 Fastest times up Alpe d'Huez")
    .attr("dy", "35")


const yLabel = svgContainer.append('g').attr("id", "y-label")
    .attr("height", width / 25)
    .attr("width", height)
    .attr("transform", `translate(${width / 50},${height / 3})`)
    .style("fill", text)

yLabel
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("font-size", "1.5rem")
    .text("Time in Minutes")



const xLabel = svgContainer.append('g').attr("id", "x-label")
    .attr("height", height / 25)
    .attr("width", width)
    .attr("transform", `translate(${width / 1.2},${height / 1.1})`)
    .style("fill", text)

xLabel
    .append("text")
    .attr("font-size", "1.5rem")
    .text("Year")


d3.json(url)
    .then(data => {
        data.map((data) => {
            let parsedTime = data.Time.split(":")
            data.Time = new Date(`1970-01-01T00:${parsedTime[0]}:${parsedTime[1]}`)
        })

        let years = data.map((data) => data["Year"])


        let maxY = d3.max(years)
        let minY = d3.min(years)

        let Xscale = d3
            .scaleLinear()
            .domain([minY - 1, maxY + 1])
            .range([padding.left, width - padding.right - padding.left])


        let xAxis = d3
            .axisBottom(Xscale)
            .tickFormat(d3.format("d"))


        // let [minT, maxT] = d3.extent(data.map(data => data.Time))
        // minT = minT.setMinutes(minT.getMinutes() - 1)
        // maxT = maxT.setMinutes(maxT.getMinutes() + 1)

        let Yscale = d3
            .scaleTime()
            // .domain([minT, maxT])
            .domain(d3.extent(data.map(data => data.Time)))
            .range([padding.top, height - padding.top - padding.bottom])

        let timeFormat = d3.timeFormat("%M:%S")

        let yAxis = d3
            .axisLeft(Yscale)
            .tickFormat(timeFormat)
            .ticks(d3.timeSecond.every(10))

        svgContainer.append("g").attr("id", "x-axis")
            .attr("transform", `translate(0,${height - padding.top - padding.bottom})`)
            .call(xAxis)

        svgContainer.append("g").attr("id", "y-axis")
            .attr("transform", `translate(${padding.left},0)`)
            .call(yAxis)

        const legend = svgContainer.append("g").attr("id", "legend");


        legend
            .attr("transform", `translate(${width * .85}, ${height / 2})`)
            .selectAll(".legend-label")
            .data(color.domain())
            .enter()
            .append("g")
            .attr("class", "legend-label")
            .attr("transform", function (d, i) {
                return `translate(0, ${i * 25})`
            })
            .append("rect")
            .attr("height", "20px")
            .attr("width", "20px")
            .style("fill", (data) => data == "nonDoping" ? color("nonDoping") : color("doping"))
        legend
            .selectAll(".legend-label")
            .append("text")
            .attr("x", 25)
            .attr("y", 15)
            .text((data) => data == "nonDoping" ? "No Doping Allegations" : "Has Doping Allegations")
            .style("fill", text)


        svgContainer.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .style("fill", (data) => color(data.Doping == "" ? "nonDoping" : "doping"))
            .attr("cx", (data) => Xscale(data.Year))
            .attr("cx", (data) => Xscale(data.Year))
            .attr("cy", (data) => Yscale(data.Time))
            .attr("data-xvalue", (data) => data.Year)
            .attr("data-yvalue", (data) => data.Time)
            .attr("r", "5")
            .on("mouseover", function (e, d) {
                d3.select(this)
                    .transition()
                    .attr("r", "7")
                    .style("fill", "red")
                let [x, y] = d3.pointer(e, svgContainer.node())
                tooltip
                    .style("position", "absolute")
                    .style("background-color", tool)
                    .style("padding", "10px")
                    .style("border-radius", "5px 5px 5px 5px")
                    .style("z-index", "1")
                    .attr("data-year", `${d.Year}`)
                    .style("transform", `translate(${x + 15}px,${y}px)`)
                    .html(`${d.Name}: ${d.Nationality} <br> Year: ${d.Year}, Time: ${timeFormat(d.Time)}<br><br>${d.Doping}`)
                    .transition()
                    .style("opacity", "1")

            })
            .on("mouseout", function (e, data) {
                d3.select(this)
                    .transition()
                    .attr("r", "5")
                    .style("fill", function () {
                        return color(data.Doping == "" ? "nonDoping" : "doping")
                    })
                tooltip
                    .style("z-index", "-100")
                    .transition()
                    .style("opacity", "0")
            })


    })




