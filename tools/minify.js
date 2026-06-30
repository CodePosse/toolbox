// I tried to make the function names make some sense.
const fs = require("fs/promises");
const fg = require("fast-glob");
const { minify } = require("html-minifier-terser");
const terser = require("terser");

(async () => {

    // HTML

    const htmlFiles = await fg("2026/**/*.html");

    for (const file of htmlFiles) {

        const html = await fs.readFile(file, "utf8");

        const output = await minify(html, {

            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            minifyCSS: true,
            minifyJS: true,
            useShortDoctype: true
        });

        await fs.writeFile(file, output);

        console.log("HTML:", file);
    }

    // JavaScript

    const jsFiles = await fg("2026/**/*.js");

    for (const file of jsFiles) {

        const source = await fs.readFile(file, "utf8");

        const result = await terser.minify(source, {

            compress: true,
            mangle: true
        });

        await fs.writeFile(file, result.code);

        console.log(" JS :", file);
    }

})();