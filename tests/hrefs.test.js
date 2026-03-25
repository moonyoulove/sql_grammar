import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { identifierToHref } from '../src/href-map.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to parse CSV robustly
const parseCSV = (str) => {
    const result = [];
    let curRow = [];
    let curToken = '';
    let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (inQuotes) {
            if (c === '"') {
                if (i + 1 < str.length && str[i + 1] === '"') {
                    curToken += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                curToken += c;
            }
        } else {
            if (c === '"') {
                inQuotes = true;
            } else if (c === ',') {
                curRow.push(curToken);
                curToken = '';
            } else if (c === '\n' || c === '\r') {
                if (c === '\r' && i + 1 < str.length && str[i + 1] === '\n') {
                    i++;
                }
                curRow.push(curToken);
                result.push(curRow);
                curRow = [];
                curToken = '';
            } else {
                curToken += c;
            }
        }
    }
    if (curRow.length > 0 || curToken) {
        curRow.push(curToken);
        result.push(curRow);
    }
    return result;
};

/**
 * Extract grammar identifiers from a syntax string.
 * Identifiers are lowercase tokens (possibly with underscores/camelCase)
 * that are NOT all-uppercase COMMANDS.
 */
function extractIdentifiers(syntax) {
    const identifiers = new Set();
    // Tokenize by splitting on whitespace and grammar meta-characters
    const tokens = syntax.split(/[\s\[\]{}\|,]+/).filter(Boolean);
    for (const token of tokens) {
        // Must start with a lowercase letter or capital-then-lower (CamelCase)
        // and only contain letters and underscores
        if (!/^[a-zA-Z_][a-zA-Z_]*$/.test(token)) continue;
        // Skip pure uppercase (COMMANDS like SELECT, FROM, etc.)
        if (/^[A-Z_]+$/.test(token)) continue;
        identifiers.add(token);
    }
    return identifiers;
}

describe('SQL Grammar Consistency Tests', () => {
    let sectionIds = new Set();
    let dataRows = [];

    beforeAll(() => {
        // Load CSV and extract section IDs (same logic as page.jsx)
        const csvContent = fs.readFileSync(path.resolve(__dirname, '../src/phoenix.csv'), 'utf8');
        const rows = parseCSV(csvContent).filter(row => row.length > 1);
        dataRows = rows.slice(1); // skip header

        dataRows.forEach(row => {
            const topic = row[1];
            if (topic) {
                const sectionId = topic.toLowerCase().replace(/\s+/g, '_');
                sectionIds.add(sectionId);
            }
        });

        console.log(`Loaded ${sectionIds.size} section IDs from phoenix.csv`);
    });

    it('should have all NonTerminal hrefs mapping to existing section IDs', () => {
        const missingHrefs = new Set(); // href -> Set of identifiers causing it

        dataRows.forEach(row => {
            const syntax = row[2];
            if (!syntax || !syntax.trim()) return;

            const identifiers = extractIdentifiers(syntax.trim());
            for (const identifier of identifiers) {
                const href = identifierToHref(identifier);
                if (!sectionIds.has(href)) {
                    missingHrefs.add(`${identifier} -> #${href}`);
                }
            }
        });

        if (missingHrefs.size > 0) {
            console.error('Broken hrefs (identifier -> target):');
            Array.from(missingHrefs).sort().forEach(m => console.error(' ', m));
        }

        expect(Array.from(missingHrefs)).toHaveLength(0);
    });
});
