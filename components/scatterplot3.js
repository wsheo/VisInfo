class Scatterplot {
    margin = {
        top: 10, right: 100, bottom: 40, left: 50
    }

    constructor(svg, tooltip, data, width = 400, height = 400) {
        this.svg = svg;
        this.tooltip = tooltip;
        this.data = data;
        this.data2 = data;
        this.width = width;
        this.height = height;
        this.handlers = {};
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.tooltip = d3.select(this.tooltip);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();
        this.zScale = d3.scaleOrdinal().range(d3.schemeCategory10);
        this.zScale.domain(["1그룹", "2그룹", "3그룹", "4그룹", "5그룹", "6그룹"]);

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        this.brush = d3.brush()
            .extent([[0, 0], [this.width, this.height]])
            .on("start brush", (event) => {
                this.brushCircles(event);
            })
    }

    update(xVar, yVar, colorVar, useColor, groupNum) {
        this.xVar = xVar;
        this.yVar = yVar;


        if(groupNum !== "all") {
            this.data = this.data.filter(d => d["group"] === groupNum);
        }

        this.xScale.domain(d3.extent(this.data, d => d[xVar])).range([0, this.width]);
        this.yScale.domain(d3.extent(this.data, d => d[yVar])).range([this.height, 0]);
        
        this.container.call(this.brush);

        this.circles = this.container.selectAll("circle")
            .data(this.data)
            .join("circle")
            .on("mouseover", (e, d) => {
                this.tooltip.select(".tooltip-inner")
                    .html(`${"국명"}: ${d["office"]}<br />${this.xVar}: ${d[this.xVar]}<br />${this.yVar}: ${d[this.yVar]}`);

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

        this.circles
            .transition()
            .attr("cx", d => this.xScale(d[xVar]))
            .attr("cy", d => this.yScale(d[yVar]))
            .attr("fill", useColor ? d => this.zScale(d[colorVar]) : "black")
            .attr("r", 3)

            

        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .transition()
            .call(d3.axisBottom(this.xScale));

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .transition()
            .call(d3.axisLeft(this.yScale));

        if (useColor) {
            this.legend
                .style("display", "inline")
                .style("font-size", ".8em")
                .attr("transform", `translate(${this.width + this.margin.left + 20}, ${this.height / 2})`)
                .call(d3.legendColor().scale(this.zScale));
        }
        else {
            this.legend.style("display", "none");
        }
        this.data = this.data2;
    }

    isBrushed(d, selection) {
        let [[x0, y0], [x1, y1]] = selection; 
        let x = this.xScale(d[this.xVar]);
        let y = this.yScale(d[this.yVar]);

        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
    }

    brushCircles(event) {
        let selection = event.selection;

        this.circles.classed("brushed", d => this.isBrushed(d, selection));

        if (this.handlers.brush)
            this.handlers.brush(this.data.filter(d => this.isBrushed(d, selection)));
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
}