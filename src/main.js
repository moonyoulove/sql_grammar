import "./style.css";
import "railroad-diagrams/railroad.css";
import * as parser from "./grammar.peggy";
import * as rr from "railroad-diagrams/railroad.js";
import "./railroad.css";
import phoenix from "./phoenix.csv";

console.clear();

const result = parser.parse(/* sql */ `
UPSERT [/*+ hint */] INTO tableName [( { columnRef | columnDef } [,...] )] select
`);

let width = 0;
let started = false;
let ended = false;
const items = [];
while (result.items.length > 0) {
    const item = result.items.shift();
    if (width + item.width > 600) {
        makeDiagram();
    }
    items.push(item);
    width += item.width;
}

ended = true;
makeDiagram();

function makeDiagram() {
    const start = new rr.Start({ type: started ? "complex" : "simple" });
    const end = new rr.End({ type: ended ? "simple" : "complex" });
    const diagram = new rr.Diagram(start, ...items, end);
    diagram.addTo(document.body);
    items.length = 0;
    width = 0;
    if (!started) {
        started = true;
    }
}
