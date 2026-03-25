import peggy from "peggy";

export default function peggyLoader(source) {
    const callback = this.async();

    try {
        const parserCode = peggy.generate(source, {
            output: "source",
            format: "es", 
        });

        callback(null, parserCode);
    } catch (e) {
        callback(e);
    }
}
