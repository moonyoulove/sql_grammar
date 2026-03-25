/**
 * Maps grammar identifiers (after snake_case normalization) to their target section IDs.
 * Only identifiers WITHOUT their own dedicated section need a mapping.
 *
 * Source of truth: topics from phoenix.csv, lowercased with spaces → underscores.
 */
export const HREF_MAP = {
    // Table references
    "new_table_ref":       "table_ref",
    "existing_table_ref":  "table_ref",

    // Terms
    "constant_term":   "term",
    "numeric_term":    "term",
    "array_term":      "term",
    "date_term":       "term",
    "date_time_term":  "term",
    "element_term":    "term",
    "first_term":      "term",
    "number_term":     "term",
    "pattern_term":    "term",
    "second_term":     "term",
    "string_term":     "string",
    "time_term":       "term",
    "timestamp_term":  "term",

    // Options
    "table_option":       "options",
    "table_options":      "options",
    "index_option":       "options",
    "index_options":      "options",
    "guidepost_option":   "options",
    "guidepost_options":  "options",

    // "function" keyword (e.g. in CLOSE syntax)
    // "function":  "create_function",

    // Names
    "column_name":  "name",
    "family_name":  "name",
    "table_name":   "name",
    "func_name":    "name",
    "index_name":   "name",
    "schema_name":  "name",
    "sequence_name":"name",

    // Aliases
    "column_alias":  "alias",
    "table_alias":   "alias",

    // Operands
    "constant_operand":  "operand",

    // Values
    "binary_value":  "value",
    "new_value":     "value",

    // Cursor
    "cursor_name":  "declare_cursor",

    // Strings → string section
    "delimiter_string":      "string",
    "format_string":         "string",
    "from_time_zone_string": "string",
    "locale_string":         "string",
    "null_string":           "null",
    "pad_string":            "string",
    "pattern_string":        "string",
    "replacement_string":    "string",
    "time_zone_id_string":   "string",
    "permission_string":     "grant",
    "user_string":           "grant",

    // Integers / numbers
    "decomposition_int":  "number",
    "dimension_int":      "number",
    "length_int":         "number",
    "multiplier_int":     "number",
    "n":                  "number",
    "nth_numeric":        "numeric",
    "length_numeric":     "numeric",
    "multiplier_number":  "number",
    "number_term":        "number",
    "offset_int":         "number",
    "precision_int":      "number",
    "scale_number":       "number",
    "seed_number":        "number",
    "start_int":          "number",
    "strength_int":       "number",

    // Decimal
    "positive_decimal":  "decimal",

    // Boolean
    "upper_case_boolean":  "boolean",

    // Constraint
    "constraint_name":  "constraint",

    // Comments
    "anything_until_end_comment":   "comments",
    "anything_until_end_of_line":   "comments",

    // Select
    "select_statement":  "select",
};

/**
 * Converts an identifier string (CamelCase or snake_case) to its target section href.
 * Returns the section ID WITHOUT a leading "#".
 *
 * Steps:
 *   1. Normalize to snake_case
 *   2. Look up in HREF_MAP; if found, return the mapped ID
 *   3. Otherwise return the snake_case version directly
 */
export function identifierToHref(identifier) {
    // Step 1: Normalize to snake_case
    let snakeCase;
    if (identifier.includes("_")) {
        snakeCase = identifier.toLowerCase();
    } else {
        snakeCase = identifier
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase()
            .replace(/^_/, "")
            .replace(/__/g, "_");
    }

    // Step 2: Apply HREF_MAP; fall back to snake_case
    return HREF_MAP[snakeCase] ?? snakeCase;
}
