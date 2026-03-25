"use client";

import { useEffect, useRef } from "react";
import "railroad-diagrams/railroad.css";
import "../src/railroad.css";
import phoenix from "../src/phoenix.csv";
import * as parser from "../src/grammar.peggy";
import * as rr from "railroad-diagrams/railroad.js";

function GrammarItem({ topic, syntax, description, example }) {
    const containerRef = useRef(null);
    const errorRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = ""; // clear previous diagram if any
        if (errorRef.current) errorRef.current.innerText = "";

        const textToParse = syntax ? syntax.trim() : "";
        if (!textToParse) return;

        try {
            const result = parser.parse(textToParse);

            let width = 0;
            let started = false;
            let ended = false;
            const items = [];

            // If the parser returns a root object with .items, use it.
            // Otherwise, if it returns an array directly, use it.
            const rawItems = result && result.items ? result.items : (Array.isArray(result) ? result : [result]);
            const resultItems = [...rawItems];

            while (resultItems.length > 0) {
                const item = resultItems.shift();
                if (!item) continue;
                if (width + (item.width || 0) > 600) {
                    makeDiagram();
                }
                items.push(item);
                width += item.width || 0;
            }

            ended = true;
            if (items.length > 0) {
                makeDiagram();
            }

            function makeDiagram() {
                const start = new rr.Start({ type: started ? "complex" : "simple" });
                const end = new rr.End({ type: ended ? "simple" : "complex" });
                const diagram = new rr.Diagram(start, ...items, end);
                diagram.addTo(containerRef.current);
                items.length = 0;
                width = 0;
                if (!started) {
                    started = true;
                }
            }
        } catch (error) {
            console.error("Syntax:", textToParse, error);
            if (errorRef.current) {
                errorRef.current.innerText = "Error parsing grammar: " + error.message;
            }
        }
    }, [syntax]);

    const sectionId = topic ? topic.toLowerCase().replace(/\s+/g, "_") : undefined;

    return (
        <div id={sectionId}
            style={{ marginBottom: "2rem", padding: "1.5rem", border: "1px solid var(--card-border)", borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)", background: "var(--card-bg)" }}
        >
            <h2 style={{ marginTop: 0, color: "var(--foreground)", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
                {topic}
            </h2>
            {description && <p style={{ lineHeight: "1.6", color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{description}</p>}

            <div
                ref={containerRef}
                style={{
                    overflowX: "auto",
                    margin: "1.5rem 0",
                    padding: "1rem",
                    background: "var(--diagram-bg)",
                    borderRadius: "4px",
                }}
            >
            </div>
            <div ref={errorRef} style={{ color: "red", fontSize: "0.9em", fontFamily: "monospace", margin: "1rem 0" }}></div>

            {example && (
                <div style={{ background: "#282c34", padding: "1rem", borderRadius: "6px", color: "#abb2bf" }}>
                    <strong style={{ display: "block", marginBottom: "0.5rem", color: "#e5c07b" }}>範例：</strong>
                    <pre style={{ whiteSpace: "pre-wrap", margin: 0, fontFamily: "monospace", fontSize: "0.9em" }}>{example.trim()}</pre>
                </div>
            )}
        </div>
    );
}

export default function Page() {
    // csv-loader returns an array of arrays. The very first row is the header.
    const dataRows = Array.isArray(phoenix) ? phoenix.slice(1) : [];

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
            <h1 style={{ textAlign: "center", marginBottom: "3rem", color: "var(--foreground)" }}>SQL Grammar Reference</h1>
            {dataRows.map((row, i) => {
                // Determine indices based on phoenix.csv headers:
                // SECTION[0], TOPIC[1], SYNTAX[2], TEXT[3], EXAMPLE[4], TEXT_ZH[5]
                const topic = row[1];
                const syntax = row[2];
                // Use Chinese text if available, otherwise fallback to English text
                const description = row[5] ? row[5].trim() : (row[3] ? row[3].trim() : "");
                const example = row[4];

                return (
                    <GrammarItem
                        key={i}
                        topic={topic}
                        syntax={syntax}
                        description={description}
                        example={example}
                    />
                );
            })}
        </div>
    );
}
