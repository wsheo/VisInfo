class Histogram {
    margin = {
        top: 10, right: 10, bottom: 40, left: 50
    }

    constructor(svg, tooltip, width = 150, height = 150) {
        this.svg = svg;
        this.width = width;
        this.height = height;
        this.tooltip = tooltip;

    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.tooltip = d3.select(this.tooltip);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleLinear();
        this.zScale = d3.scaleOrdinal().range(d3.schemeCategory10)

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    }

    update(data, xVar, yVar, useColor, groupNum) {
        const categories = ["1그룹", "2그룹", "3그룹", "4그룹", "5그룹", "6그룹"];
        this.data = data;
        this.yVar = yVar;
        const yValue = {};
        const filtered_data = {};

        if(this.yVar === "count"){
            categories.forEach(c => {
                filtered_data[c] = this.data.filter(d => d[xVar] === c);
                yValue[c] = parseInt(filtered_data[c].length);
            this.yScale.domain([0, d3.max(Object.values(yValue))]).range([this.height, 0]);
            });
        } else  if(this.yVar === "growth.rate"){
            categories.forEach(c => {
                filtered_data[c] = this.data.filter(d => d[xVar] === c);
                yValue[c] = parseInt(d3.mean(filtered_data[c], d => d[this.yVar]));
            this.yScale.domain(d3.extent(Object.values(yValue), d =>d*1.1)).range([this.height, 0]);
            })
        } else {
            categories.forEach(c => {
                filtered_data[c] = this.data.filter(d => d[xVar] === c);
                yValue[c] = parseInt(d3.mean(filtered_data[c], d => d[this.yVar]));
            this.yScale.domain([0, d3.max(Object.values(yValue))]).range([this.height, 0]);;
            })
        }


        this.xScale.domain(categories).range([0, this.width]).padding(0.3);

        this.zScale.domain(["1그룹", "2그룹", "3그룹", "4그룹", "5그룹", "6그룹"]);

        if(groupNum !== "all") {
            categories.map(c => {
                yValue[c] = (groupNum === c ? yValue[c] : undefined);  
            }) 
        }

        this.rect = this.container.selectAll("rect")
        .data(this.data)
        .join("rect")
        .on("mouseover", (e, d) => {
            this.tooltip.select(".tooltip-inner")
                .html(`${this.yVar}: ${yValue[d]}`);

            Popper.createPopper(e.target, this.tooltip.node(), {
                placement: 'top',
                modifiers: [
                    {
                        name: 'arrow',
                        options: {
                            element: this.tooltip.select(".tooltip-arrow").node(),
                        },
                    },
                ],
            });

            this.tooltip.style("display", "block");
        })
        .on("mouseout", (d) => {
            this.tooltip.style("display", "none");
        });

        this.container.selectAll("rect")
            .data(categories)
            .join("rect")
            .attr("x", d => this.xScale(d))
            .attr("y", d => this.yScale(yValue[d]))
            .attr("width", this.xScale.bandwidth())
            .attr("height", d => (this.height - this.yScale(yValue[d])))
            .attr("fill", useColor ? d => this.zScale(d) : "Gray");

        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(d3.axisBottom(this.xScale));

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(this.yScale));

        if (useColor) {
            this.legend
                .style("display", "inline")
                .style("font-size", ".8em")
                .attr("transform", `translate(${this.width + this.margin.left + 10}, ${this.height / 2})`)
                .call(d3.legendColor().scale(this.zScale));
        }  else {
            this.legend.style("display", "none");
        }
    }
}