class DataTable {
    constructor(id) {
        this.id = id;
    }

    update(data, columns, groupNum) {
        let table = d3.select(this.id);
        this.data = data;


        if(groupNum !== "all") {
            this.data = this.data.filter(d => d["group"] === groupNum);
        }


        let rows = table
            .selectAll("tr")
            .data(this.data)
            .join("tr");

        rows.selectAll("td")
            .data(d => columns.map(c => d[c]))
            .join("td")
            .text(d => d)
    }
}
