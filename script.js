// List of states classified as North or South
const northStates = ["Connecticut", "Maine", "Massachusetts", "New Hampshire", "Rhode Island", "Vermont", 
                     "New Jersey", "New York", "Pennsylvania", "Illinois", "Indiana", "Michigan", "Ohio", 
                     "Wisconsin", "Iowa", "Kansas", "Minnesota", "Missouri", "Nebraska", "North Dakota", 
                     "South Dakota"];
const southStates = ["Delaware", "Florida", "Georgia", "Maryland", "North Carolina", "South Carolina", 
                     "Virginia", "West Virginia", "Alabama", "Kentucky", "Mississippi", "Tennessee", 
                     "Arkansas", "Louisiana", "Oklahoma", "Texas"];

let currentStateData;
let currentYear = 'total';

// Load the CSV data
d3.csv("data.csv").then(data => {
    data.forEach(d => {
        d.date = new Date(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
    });

    // Calculate the total cases and deaths per state
    const stateData = d3.rollup(data, v => {
        return {
            cases: d3.sum(v, d => d.cases),
            deaths: d3.sum(v, d => d.deaths)
        };
    }, d => d.state);

    const stateArray = Array.from(stateData, ([state, values]) => ({
        state, 
        cases: values.cases,
        deaths: values.deaths,
        region: northStates.includes(state) ? 'North' : southStates.includes(state) ? 'South' : 'Other'
    }));

    currentStateData = stateArray;
    initVisualization(stateArray);

    d3.select("#next").on("click", () => {
        if (currentYear === 'total') {
            const filteredData2021 = data.filter(d => d.date.getFullYear() === 2021);

            const stateData2021 = d3.rollup(filteredData2021, v => {
                return {
                    cases: d3.sum(v, d => d.cases),
                    deaths: d3.sum(v, d => d.deaths)
                };
            }, d => d.state);

            const stateArray2021 = Array.from(stateData2021, ([state, values]) => ({
                state, 
                cases: values.cases,
                deaths: values.deaths,
                region: northStates.includes(state) ? 'North' : southStates.includes(state) ? 'South' : 'Other'
            }));

            currentStateData = stateArray2021;
            currentYear = '2021';
            updateVisualization(stateArray2021);
            updateNarrative(stateArray2021, 2021);
        } else if (currentYear === '2021') {
            const filteredData2022 = data.filter(d => d.date.getFullYear() === 2022);

            const stateData2022 = d3.rollup(filteredData2022, v => {
                return {
                    cases: d3.sum(v, d => d.cases),
                    deaths: d3.sum(v, d => d.deaths)
                };
            }, d => d.state);

            const stateArray2022 = Array.from(stateData2022, ([state, values]) => ({
                state, 
                cases: values.cases,
                deaths: values.deaths,
                region: northStates.includes(state) ? 'North' : southStates.includes(state) ? 'South' : 'Other'
            }));

            currentStateData = stateArray2022;
            currentYear = '2022';
            updateVisualization(stateArray2022);
            updateNarrative(stateArray2022, 2022);
        } else if (currentYear === '2022') {
            const filteredData2023 = data.filter(d => d.date.getFullYear() === 2023);

            const stateData2023 = d3.rollup(filteredData2023, v => {
                return {
                    cases: d3.sum(v, d => d.cases),
                    deaths: d3.sum(v, d => d.deaths)
                };
            }, d => d.state);

            const stateArray2023 = Array.from(stateData2023, ([state, values]) => ({
                state, 
                cases: values.cases,
                deaths: values.deaths,
                region: northStates.includes(state) ? 'North' : southStates.includes(state) ? 'South' : 'Other'
            }));

            currentStateData = stateArray2023;
            currentYear = '2023';
            updateVisualization(stateArray2023);
            updateNarrative(stateArray2023, 2023);
        } else {
            currentStateData = stateArray;
            currentYear = 'total';
            updateVisualization(stateArray);
            updateNarrative(stateArray, 'total');
        }
    });

    d3.select("#back").on("click", () => {
        currentStateData = stateArray;
        currentYear = 'total';
        updateVisualization(stateArray);
        updateNarrative(stateArray, 'total');
    });

    d3.select("#stateFilter").on("change", () => {
        const selectedState = d3.select("#stateFilter").property("value");
        if (selectedState === "all") {
            updateVisualization(currentStateData);
        } else if (selectedState === "north") {
            const filteredData = currentStateData.filter(d => northStates.includes(d.state));
            updateVisualization(filteredData);
        } else if (selectedState === "south") {
            const filteredData = currentStateData.filter(d => southStates.includes(d.state));
            updateVisualization(filteredData);
        } else {
            const filteredData = currentStateData.filter(d => d.state === selectedState);
            updateVisualization(filteredData);
        }
    });

    // Populate the dropdown with states
    const stateFilter = d3.select("#stateFilter");
    stateArray.forEach(d => {
        stateFilter.append("option")
            .attr("value", d.state)
            .text(d.state);
    });

    updateNarrative(stateArray, 'total');
});

function initVisualization(stateData) {
    const svgWidth = 1200;
    const svgHeight = 500;
    const margin = { top: 20, right: 30, bottom: 100, left: 60 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#visualization")
                  .append("svg")
                  .attr("width", svgWidth)
                  .attr("height", svgHeight)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
                .domain(stateData.map(d => d.state))
                .range([0, width])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, d3.max(stateData, d => d.cases / 100000)])
                .nice()
                .range([height, 0]);

    const tooltip = d3.select("#tooltip");

    const formatNumber = d3.format(",.2f");

    svg.append("g")
       .selectAll(".bar")
       .data(stateData)
       .enter()
       .append("rect")
       .attr("class", "bar")
       .attr("x", d => x(d.state))
       .attr("y", d => y(d.cases / 100000))
       .attr("width", x.bandwidth())
       .attr("height", d => height - y(d.cases / 100000))
       .attr("fill", "steelblue")
       .on("mouseover", (event, d) => {
            tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
            tooltip.html(`State: ${d.state}<br/>Region: ${d.region}<br/>Cases: ${formatNumber(d.cases)}`)
                   .style("left", (event.pageX) + "px")
                   .style("top", (event.pageY - 28) + "px");
       })
       .on("mouseout", d => {
            tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
       });

    svg.append("g")
       .attr("class", "x-axis")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x))
       .selectAll("text")
       .attr("transform", "rotate(-45)")
       .style("text-anchor", "end");

    svg.append("g")
       .attr("class", "y-axis")
       .call(d3.axisLeft(y).ticks(10, "s"));
}

function updateVisualization(stateData) {
    const svgWidth = 1200;
    const svgHeight = 500;
    const margin = { top: 20, right: 30, bottom: 100, left: 60 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#visualization svg g");

    const x = d3.scaleBand()
                .domain(stateData.map(d => d.state))
                .range([0, width])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, d3.max(stateData, d => d.cases / 100000)])
                .nice()
                .range([height, 0]);

    const tooltip = d3.select("#tooltip");

    const formatNumber = d3.format(",.2f");

    svg.selectAll(".bar")
       .data(stateData)
       .join("rect")
       .attr("class", "bar")
       .attr("x", d => x(d.state))
       .attr("y", d => y(d.cases / 100000))
       .attr("width", x.bandwidth())
       .attr("height", d => height - y(d.cases / 100000))
       .attr("fill", "steelblue")
       .on("mouseover", (event, d) => {
            tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
            tooltip.html(`State: ${d.state}<br/>Region: ${d.region}<br/>Cases: ${formatNumber(d.cases)}`)
                   .style("left", (event.pageX) + "px")
                   .style("top", (event.pageY - 28) + "px");
       })
       .on("mouseout", d => {
            tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
       });

    svg.select(".x-axis")
       .call(d3.axisBottom(x))
       .selectAll("text")
       .attr("transform", "rotate(-45)")
       .style("text-anchor", "end");

    svg.select(".y-axis")
       .call(d3.axisLeft(y).ticks(10, "s"));
}

function updateNarrative(stateData, year) {
    const sortedStates = stateData.slice().sort((a, b) => b.cases - a.cases);
    const maxState = sortedStates[0];
    const secondMaxState = sortedStates[1];
    const minState = sortedStates[sortedStates.length - 1];
    d3.select("#narrative").html(
        `This bar chart shows the total COVID-19 cases per state${year === 'total' ? '' : ` for the year ${year}`}.<br/>
        The state with the highest number of cases is ${maxState.state} <br/>
        The state with the second highest number of cases is ${secondMaxState.state}  cases.<br/>
        The state with the lowest number of cases is ${minState.state} cases.`
    );
}
