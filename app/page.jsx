"use client";

import { useEffect, useRef, useState } from "react";
import "railroad-diagrams/railroad.css";
import "../src/railroad.css";
import "highlight.js/styles/atom-one-dark.css";
import phoenix from "../src/phoenix.csv";
import * as parser from "../src/grammar.peggy";
import * as rr from "railroad-diagrams/railroad.js";
import hljs from "highlight.js/lib/core";
import sql from "highlight.js/lib/languages/sql";

hljs.registerLanguage("sql", sql);

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
                // Chunk items into rows to force wrapping
                const chunkSize = 3;
                const rows = [];
                for (let i = 0; i < items.length; i += chunkSize) {
                    const chunk = items.slice(i, i + chunkSize);
                    rows.push(new rr.Sequence(...chunk));
                }

                const stack = new rr.Stack(...rows);
                const diagram = new rr.Diagram(stack);
                diagram.addTo(containerRef.current);
                items.length = 0;
                width = 0;
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
        <div id={sectionId} className="grammar-card">
            <h2 className="grammar-title">
                {topic}
            </h2>
            {description && <p className="grammar-description">{description}</p>}

            <div
                ref={containerRef}
                className="diagram-container"
            >
            </div>
            <div ref={errorRef} style={{ color: "red", fontSize: "0.9em", fontFamily: "monospace", margin: "1rem 0" }}></div>

            {example && (
                <div className="example-box">
                    <strong style={{ display: "block", marginBottom: "0.5rem", color: "#e5c07b" }}>範例：</strong>
                    <pre style={{ margin: 0 }}><code
                        className="language-sql hljs"
                        style={{ fontFamily: "monospace", fontSize: "0.9em", whiteSpace: "pre-wrap", background: "transparent", padding: 0 }}
                        dangerouslySetInnerHTML={{
                            __html: hljs.highlight(example.trim(), { language: "sql" }).value
                        }}
                    /></pre>
                </div>
            )}
        </div>
    );
}


export default function Page() {
    const [searchQuery, setSearchQuery] = useState("");
    const [showScrollTop, setShowScrollTop] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    // csv-loader returns an array of arrays. The very first row is the header.
    // SECTION[0], TOPIC[1], SYNTAX[2], TEXT[3], EXAMPLE[4], TEXT_ZH[5]
    const dataRows = Array.isArray(phoenix) 
        ? phoenix.slice(1).filter(row => row.some(cell => cell && cell.trim())) 
        : [];

    // Group rows by Section for TOC
    const sections = {};
    dataRows.forEach(row => {
        const sectionName = row[0] || "General";
        if (!sections[sectionName]) {
            sections[sectionName] = [];
        }
        sections[sectionName].push(row);
    });

    const sectionOrder = Object.keys(sections);

    const filteredSectionOrder = sectionOrder.filter(sectionName => {
        const matchesSection = sectionName.toLowerCase().includes(searchQuery.toLowerCase());
        const hasMatchingTopic = sections[sectionName].some(row => 
            row[1] && row[1].toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesSection || hasMatchingTopic;
    });

    return (
        <div className="app-container">
            <aside className="sidebar">
                <h3 
                    className="sidebar-title" 
                    data-text="SQL Reference" 
                    aria-label="SQL Reference"
                    style={{ fontSize: "1.2rem", marginBottom: "1rem", fontWeight: 800 }}
                >
                </h3>

                <div className="search-container">
                    <svg 
                        className="search-icon"
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ 
                            position: "absolute", 
                            left: "1rem", 
                            top: "50%", 
                            transform: "translateY(-50%)", 
                            pointerEvents: "none"
                        }}
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="搜尋語法..." 
                        className="sidebar-search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {filteredSectionOrder.map(sectionName => {
                    const matchedItems = sections[sectionName].filter(row => 
                        !searchQuery || 
                        row[1]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        sectionName.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (matchedItems.length === 0) return null;

                    return (
                        <div key={sectionName} className="toc-section">
                            <div className="toc-section-title" data-text={sectionName} aria-label={sectionName}></div>
                            <ul className="toc-list">
                                {matchedItems.map((row, idx) => {
                                    const topic = row[1];
                                    const slug = topic ? topic.toLowerCase().replace(/\s+/g, "_") : `row-${idx}`;
                                    return (
                                        <li key={`${sectionName}-${idx}`} className="toc-item">
                                            <a href={`#${slug}`} className="toc-link" data-text={topic} aria-label={topic}>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </aside>

            <main className="main-content">
                <section className="hero-section">
                    <h1 className="hero-title">SQL Reference</h1>
                    <p className="hero-subtitle">基於 Apache Phoenix 官方語法文件開發的視覺化 SQL 參考手冊</p>
                </section>
                
                {sectionOrder.map(sectionName => (
                    <div key={sectionName} style={{ marginBottom: "4rem" }}>
                        <h2 style={{ 
                            fontSize: "1.5rem", 
                            textTransform: "uppercase", 
                            letterSpacing: "0.1em", 
                            color: "var(--text-muted)", 
                            marginBottom: "1.5rem",
                            borderBottom: "2px solid var(--card-border)",
                            display: "inline-block",
                            paddingBottom: "0.25rem"
                        }}>
                            {sectionName}
                        </h2>
                        {sections[sectionName].map((row, idx) => {
                            const topic = row[1];
                            const syntax = row[2];
                            const description = row[5] ? row[5].trim() : (row[3] ? row[3].trim() : "");
                            const example = row[4];

                            return (
                                <GrammarItem
                                    key={idx}
                                    topic={topic}
                                    syntax={syntax}
                                    description={description}
                                    example={example}
                                />
                            );
                        })}
                    </div>
                ))}
            </main>

            <button
                className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
                title="回到頂部"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
            </button>
        </div>
    );
}
