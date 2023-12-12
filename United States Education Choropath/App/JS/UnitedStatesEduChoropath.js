// D3 Lib Choropath Map of United States Education Attainment

const EduDataURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"

const countyData = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"

const height = 800,
    width = 1200
const padding = {
    top: 120,
    right: 20,
    bottom: 75,
    left: 70,
}

const svg = d3.select("#container").append("svg")
    .attr("height", height)
    .attr("width", width)
    .style("background", 'lightgrey')

const header = svg.append("g").attr("id", "heading")
    .attr("transform", `translate(${width / 2},${height / 20})`)
    .attr("text-anchor", "middle")

header.append("text").attr("id", 'title')
    .text("United States Educational Attainment")
    .style("font-size", "2rem")

header.append("text").attr("id", 'description')
    .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)")
    .style("font-size", "1.5rem")
    .attr("dy", 35)

const tooltip = d3.select('body').append("div")
    .attr("id", 'tooltip')
    .style("opacity", 0)
    .style("position", "absolute")

const color = d3.scaleOrdinal(d3.schemePurples[9])
console.log(color.range())

Promise.all([d3.json(EduDataURL), d3.json(countyData)])
    .then((data) => {
        let EduData = data[0]
        let countyData = data[1]
        launch(EduData, countyData)
    })

function launch(education, counties) {

    const legend = svg.append("g").attr("id", 'legend')
        .attr("transform", `translate(${width * .6},${height * .2})`)
    const legendWidth = 300
    let [minE, maxE] = d3.extent(education.map((data) => data.bachelorsOrHigher))
    console.log(minE)
    console.log(maxE)

    let legendThreshold = d3
        .scaleThreshold()
        .domain(d3.range(minE, maxE, (maxE - minE) / 8))
        .range(color.range())

    let legendScale = d3
        .scaleLinear()
        .domain([minE, maxE])
        .range([0, legendWidth])

    let legendAxis = d3
        .axisBottom(legendScale)
        .tickValues(legendThreshold.domain())
        .tickSize(10, 0)
        .tickFormat((d) => {
            return Math.round(d) + "%"
        })

    console.log(legendThreshold.domain())

    legend.append("g").attr('id', "legend-axis")
        .call(legendAxis)
        .select('.domain')
        .remove()


    legend.append("g").attr("id", "legend-colorScale")
        .selectAll("rect")
        .data(legendThreshold.range().map((color) => {
            let d = legendThreshold.invertExtent(color)
            if (d[0] === null) d[0] = legendScale.domain()[0]
            if (d[1] === null) d[1] = legendScale.domain()[1]
            // console.log(d)
            return d
        }))
        .enter()
        .append("rect")
        .attr("height", 10)
        .attr("width", function (d) {
            return d[1] && d[0] ? legendScale(d[1]) - legendScale(d[0]) : legendScale(null)
        })
        .attr("x", function (d, i) {
            return (legendScale(d[0]))
        })
        .style("fill", function (data) {
            return legendThreshold(data[0])
        })


    svg.append("g").attr("id", "counties")
        .attr("transform", `translate(${width * .1},${(height * .2)})`)
        .attr("text-anchor", "middle")
        .selectAll("path")
        .data(topojson.feature(counties, counties['objects']['counties']).features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("data-fips", (d) => d.id)
        .attr("data-education", function (d) {
            let result = education.filter((object) => d.id == object.fips)
            return result[0].bachelorsOrHigher
        })
        .attr("d", d3.geoPath())
        .style("fill", function (d) {
            let result = education.filter((object) => d.id == object.fips)
            return legendThreshold(result[0].bachelorsOrHigher)
        })
        .on("mouseover", function (e, counties) {
            let [x, y] = d3.pointer(e, svg.node())
            let educationE = education.filter((data) => {
                return data.fips == counties.id
            })
            tooltip
                .style('opacity', .9)
                .style('background-color', 'grey')
                .style('padding', '5px')
                .style('border-radius', '2px 2px 2px 2px')
                .attr('data-education', `${educationE[0]['bachelorsOrHigher']}`)
                .style('transform', `translate(${(x -= width / 2) + 120}px,${(y -= height / 2)}px)`)
                .html(`${educationE[0]['area_name']}, ${educationE[0].state}: ${educationE[0]['bachelorsOrHigher']}%`)
        })
        .on("mouseout", function (e, d) {
            tooltip
                .style('opacity', 0)
        })

    svg
        .append("path")
        .attr("transform", `translate(${width * .1},${(height * .2)})`)
        .datum(topojson.mesh(counties, counties['objects']['states'], function (a, b) {
            return a !== b;
        }))
        .attr('class', 'states')
        .attr('d', d3.geoPath())
        .attr("stroke", "white")
        .attr("fill", "none")


}

