//Montly Global Heat Map with D3 Library

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

const width = 1000,
    height = 800
let padding = {
    top: 125,
    right: 75,
    bottom: 150,
    left: 75,
}

const svg = d3.select("#container")
    .append("svg")
    .attr("height", height)
    .attr("width", width)

const tooltip = d3.select("#container")
    .append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("opacity", 0)

const title = svg.append('g').attr("id", "title")
    .attr("transform", `translate(${width / 2},${height / 20})`)
    .attr("font-size", "1.5rem")
    .attr("text-anchor", "middle")
title
    .append("text")
    .text("Monthly Global Land-Surface Temperature")


d3.json(url)
    .then(data => {
        let basetemp = data.baseTemperature
        title
            .append("text")
            .text(`1753 - 2015: base temperature ${basetemp}`)
            .attr("id", "description")
            .attr("dy", "35")
        let monthlyVarience = data.monthlyVariance

        monthlyVarience.map(data => {
            let year = data.year
            let month = data.month
            data.year = new Date(`${year}-${month}-01`)
            data.month = new Date(`1970-${month}-01`)
        })

        let years = monthlyVarience.map(data => {
            return data.year.getUTCFullYear()
        })
        let months = monthlyVarience.map(data => {
            return data.month
        })



        let [minY, maxY] = d3.extent(years)

        let xScale = d3
            .scaleBand()
            .domain(years.filter((data, i) => {
                return years.indexOf(data) === i
            }))
            .range([padding.left, width])
            .padding(0)


        let xAxis = d3
            .axisBottom(xScale)
            .tickValues(
                xScale.domain().filter((years) => years % 10 == 0)
            )



        svg.append("g").attr("id", "x-axis")
            .attr("transform", `translate(0,${height - padding.bottom})`)
            .call(xAxis)
            .append("text")
            .attr("dx", `${xScale.range()[1] / 2}`)
            .attr("dy", "45")
            .text("Years")
            .style('fill', 'black')
            .attr('font-size', '1rem')


        let yScale = d3
            .scaleBand()
            .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
            .range([padding.top, height - padding.bottom])

        let yAxis = d3
            .axisLeft(yScale)
            .tickValues(yScale.domain())
            .tickFormat((months) => {
                let date = new Date(0)
                date.setUTCMonth(months)
                let monthFormat = d3.utcFormat("%B")
                return monthFormat(date)
            })

        svg.append("g").attr("id", "y-axis")
            .attr("transform", `translate(${padding.left},0)`)
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("dx", `-${yScale.range()[1] / 2}`)
            .attr("dy", -60)
            .attr('font-size', '1rem')
            .text("Months")
            .style('fill', 'black')

        let variance = monthlyVarience.map((data) => data.variance)
        let [minV, maxV] = d3.extent(variance)
        console.log(minV)
        console.log(maxV)

        // legend is another mini chart 
        let minTemp = data.baseTemperature + minV
        let maxTemp = data.baseTemperature + maxV


        const color = d3.scaleOrdinal(d3.schemeRdBu[11])


        let legendWidth = 400
        let legendHeight = 40

        const legendThreshold = d3
            .scaleThreshold()
            .domain((function (min, max, count) {
                let array = []
                let step = (max - min) / color.range().length
                let base = min
                for (let i = 1; i < count; i++) {
                    array.push(base + i * step)
                }
                return array
            })(minTemp, maxTemp, color.range().length))
            .range(color.range().reverse())

        const legendScale = d3
            .scaleLinear()
            .domain([minTemp, maxTemp])
            .range([0, legendWidth])

        let legendAxis = d3
            .axisBottom(legendScale)
            .tickSize(10, 0)
            .tickValues(legendThreshold.domain())
            .tickFormat(d3.format(".1f"))

        const legend = svg.append("g").attr("id", "legend")
            .attr("transform", `translate(${padding.left},${height - 2 * legendHeight})`)
            .attr("width", legendWidth)
            .attr("height", legendHeight)


        legend.append("g").attr("id", "legend-colorScale")
            .selectAll("rect")
            .data(legendThreshold.range().map((color) => {
                let d = legendThreshold.invertExtent(color)
                if (d[0] === null) d[0] = legendScale.domain()[0]
                else if (d[1] === null) d[1] = legendScale.domain()[1]
                return d
            }))
            .enter()
            .append("rect")
            .attr("height", legendHeight)
            .attr("width", d => d[0] && d[1] ? legendScale(d[1]) - legendScale(d[0]) : legendScale(null))
            .attr("x", (d, i) => legendScale(d[0]))
            .style("fill", (data) => legendThreshold(data[0]))


        legend.append("g").attr("id", "legend-axis")
            .attr("transform", `translate(0,${legendHeight})`)
            .call(legendAxis)

        const map = svg.append("g").attr("class", "map")
            .attr("height", height - padding.top - padding.bottom)
            .attr("width", width - padding.left - padding.right)
        // .attr("transform", `translate(${padding.left},${padding.top})`)
        map
            .selectAll("rect")
            .data(monthlyVarience)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("data-month", (d) => d.month.getUTCMonth())
            .attr("data-year", (d) => d.year.getUTCFullYear())
            .attr("data-temp", (d) => data.baseTemperature + d.variance)
            .attr("x", (d) => xScale(d.year.getUTCFullYear()))
            .attr("y", (d) => yScale(d.month.getUTCMonth()))
            .attr('width', d => xScale.bandwidth(d.year.getUTCFullYear()))
            .attr('height', d => yScale.bandwidth(d.month.getUTCMonth()))
            .style("fill", (d) => {
                return legendThreshold(data.baseTemperature + d.variance)
            })
            .on("mouseover", function (e, d) {
                d3.select(this)
                    .transition()
                    .style("stroke", "black")
                let [x, y] = d3.pointer(e, svg.node())

                tooltip
                    .style("background", "lightGreen")
                    .style("padding", "10px")
                    .style("border-radius", "5px 5px 5px 5px")
                    .style("z-index", "1")
                    .style("transform", `translate(${x}px,${y - height}px)`)
                    .style("text-align", "center")
                    .attr("data-year", `${d.year.getUTCFullYear()}`)
                    .html(`${d.year.getUTCFullYear()} - ${d.month.toLocaleString('default', { month: 'long' })}<br>
                        ${d3.format(".1f")(data.baseTemperature + d.variance)} <br>
                        ${d3.format(".1f")(d.variance)}`)
                    .transition()
                    .style("opacity", 1)
            })
            .on("mouseout", function (e, data) {
                d3.select(this)
                    .transition()
                    .style("stroke", "")
                tooltip
                    .style("opacity", 0)
            })



        // adjust the tooltip to display the values it wants
    })