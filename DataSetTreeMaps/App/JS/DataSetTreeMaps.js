// So Treemaps with D3 this time with 3 different data sets :O 

const dataSets = {
    Movies: {
        title: 'Movie Sales',
        description: "Top 100 Highest Grossing Movies Groupd by Genre",
        file: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
    },
    VideoGames: {
        title: 'Video Game Sales',
        description: "Top 100 Most Sold Video Games Groupd by Platform",
        file: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
    },
    Kickstarter: {
        title: 'Kickstarter Pledges',
        description: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
        file: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
    }
}

let dataSet = dataSets[new URLSearchParams(window.location.search).get("data")]
let defaultDataSet = dataSets.VideoGames
let workingSet = dataSet ? dataSet : defaultDataSet
let color = d3.scaleOrdinal(d3.schemePastel2)

const urlContainer = d3.select("body").append("div").attr("id", "urlContainer")

Object.keys(dataSets).forEach((set) => {
    d3.select("#urlContainer").append("a")
        .attr("href", `?data=${set}`)
        .text(`${set} Data Set`)
})

const height = 570,
    width = 960


const title = d3.select("body")
    .append("h1")
    .attr("id", "title")
    .text(workingSet.title)
const description = d3.select("body")
    .append("div")
    .attr("id", "description")
    .text(workingSet.description)
const svg = d3.select("body").append("svg").attr("id", "board")
    .attr("height", height)
    .attr("width", width)

const legend = d3.select("body").append("svg").attr("id", "legend")

const tooltip = d3.select("body").append("div")
    .attr("id", 'tooltip')
    .style("opacity", 0)
    .style("position", "absolute")

d3.json(workingSet.file)
    .then((data) => {
        const root = d3.hierarchy(data)
            .sum((d) => d.value)
            .sort((a, b) => b.height - a.height || b.value - a.value)

        const treemap = d3.treemap()
            .size([width, height])
            .padding(1)
        treemap(root)

        let cells = svg
            .selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("class", "leaves")
            .attr("transform", function (d) {
                return `translate(${d.x0},${d.y0})`
            })
            .on("mousemove", (e, d) => {
                tooltip
                    .style("opacity", .9)
                    .style('left', `${(e.pageX) + 20}px`)
                    .style('top', `${(e.pageY)}px`)
                    .style("background", "#957DAD")
                    .style("padding", "6px")
                    .style("border-radius", "3px 3px 3px 3px")
                    .attr("data-value", `${d.data.value}`)
                    .html(`Name: ${d.data.name} <br>
                    Category: ${d.data.category} <br>
                    Value: ${d.data.value}`)
            })
            .on("mouseout", () => {
                tooltip
                    .style('opacity', 0)
            })
        cells.append("clipPath")
            .attr("id", (d, i) => `clip-${i}`)
            .append("rect")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("width", function (d) { return d.x1 - d.x0; })
            .attr("height", function (d) { return d.y1 - d.y0; })

        cells.append("rect")
            .attr("class", "tile")
            .attr("x", function (d) { return d.x })
            .attr("y", function (d) { return d.y })
            .attr("width", function (d) { return d.x1 - d.x0 })
            .attr("height", function (d) { return d.y1 - d.y0 })
            .attr("data-name", (d) => d.data.name)
            .attr("data-category", (d) => d.data.category)
            .attr("data-value", (d) => d.data.value)
            .attr("fill", (d) => color(d.data.category))


        cells
            .append('text')
            .attr("clip-path", (d, i) => `url(#clip-${i})`)
            .attr('class', 'tile-text')
            .selectAll('tspan')
            .data(function (d) {
                return d.data.name.split(/(?=[A-Z][a-z])/g);
            })
            .join('tspan')
            .attr('x', 2)
            .attr('y', function (d, i) {
                return 13 + i * 12;
            })
            .text(function (d) {
                return d;
            })
        const legendH = 400,
            legendW = 600

        const rectH = 30,
            rectW = 30
        legend
            .attr("height", legendH)
            .attr("width", legendW)


        let categoriesList = [...new Set(root.leaves().map((data) => { return data.data.category }))]


        // const uniqueCategories = root.leaves().reduce((array, currentLeaf) => {
        //     if (!array.includes(currentLeaf.data.category)) {
        //         array.push(currentLeaf.data.category);
        //     }
        //     return array;
        // }, []);

        // console.log(uniqueCategories);


        const legendCategories = legend
            .selectAll("g")
            .data(categoriesList)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => {
                let step = (legendW - 20) / 3
                let breaks = (legendH - 20) / (categoriesList.length / 3)
                let x = step * (i % 3) + 10
                let y = Math.floor((i / 3)) * breaks

                return `translate(${x},${y})`
            })



        legendCategories
            .append("rect")
            .attr("class", "legend-item")
            .attr("width", rectW)
            .attr("height", rectH)
            .attr("fill", (d) => color(d))

        legendCategories
            .append("text")
            .attr("x", rectW + 20)
            .attr("y", rectH / 2)
            .text((d) => d)




    })
