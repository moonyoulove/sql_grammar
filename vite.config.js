import { defineConfig } from "vite";
import peggy from "peggy";
import dsv from "@rollup/plugin-dsv";

const peggyPlugin = {
    name: "vite-plugin-peggy",
    transform(code, id) {
        if (id.endsWith(".pegjs") || id.endsWith(".peggy")) {
            const parser = peggy.generate(code, { output: "source", format: "es" });
            return {
                code: parser,
            };
        }
    },
};

export default defineConfig({
    plugins: [peggyPlugin, dsv()],
});
