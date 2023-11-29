// Bar Chart of United States GDP by Tony Fang

const
    width = 900,
    height = 500

const svgContainer = d3.select(".visualHolder")
    .append("svg")
    .attr("height", height)
    .attr("width", width)

const tooltip = d3.select(".visualHolder")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", "0")

d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json')
    .then(data => {
        let moddedtext = data.urlize_name.replace(/-/g, " ")
        let barW = width / data.data.length //length = 275
        let padding = 50

        let Dates = data.data.map((item) => {
            return new Date(item[0])
        })
        let maxX = new Date(d3.max(Dates))
        maxX.setMonth(maxX.getMonth() + 3)
        let Xscale = d3
            .scaleTime()
            .domain([d3.min(Dates), maxX])
            .range([padding, width - padding])

        let GDP = data.data.map((item) => {
            return item[1]
        })

        let maxY = d3.max(GDP)
        let Yscale = d3
            .scaleLinear()
            .domain([padding, maxY])
            .range([height - padding, padding])

        svgContainer
            .append('text')
            .attr("transform", "rotate(-90)")
            .attr("x", "-250")
            .attr("y", "100")
            .attr("font-size", ".8rem")
            .text(moddedtext)


        let xAxis = d3.axisBottom().scale(Xscale)
        svgContainer
            .append("g")
            .call(xAxis)
            .attr("id", "x-Axis")
            .attr("transform", "translate(0," + (height - padding) + ")")

        let yAxis = d3.axisLeft().scale(Yscale)
        svgContainer
            .append("g")
            .call(yAxis)
            .attr("id", "y-Axis")
            .attr("transform", "translate(" + padding + ",0)")

        svgContainer.selectAll("rect")
            .data(data.data)
            .enter()
            .append("rect")
            .attr("width", barW)
            .attr("height", (d, i) => height - Yscale(d[1]) - padding)
            .attr("x", (d, i) => Xscale(Dates[i]))
            .attr("y", (d, i) => Yscale(d[1]))
            .attr("fill", "#20b2aa")
            .attr("class", "bar")
            .on("mouseover", function (e, d) {
                let [x, y] = d3.pointer(e, svgContainer.node())
                y -= height
                let splitDate = d[0].split("-")
                let year = splitDate[0]
                let quarter = (splitDate[1] == "01") ? "Q1" :
                    (splitDate[1] === "04") ? "Q2" :
                        (splitDate[1] == "07") ? "Q3" :
                            (splitDate[1] == "10") ? "Q4" : null
                let value = Number(d[1]).toLocaleString()
                tooltip
                    .style("opacity", ".8")
                    .html(`${year} ${quarter} <br> $${value} Billion`)
                    .transition()
                    .duration(0)
                    .style("transform", `translate(${x + 15}px,${y - 50}px)`)
            })
            .on("mouseout", function () {
                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", "0")
            })
    })  
