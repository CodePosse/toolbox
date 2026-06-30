const fs = require("fs/promises");
const fg = require("fast-glob");
const prettier = require("prettier");

(async () => {

    const files = await fg([
        "2026/**/*.html",
        "2026/**/*.js",
        "2026/**/*.css",
        "2026/**/*.json",
        "2026/**/*.md"
    ]);

    for (const file of files) {

        const parser =
            file.endsWith(".html") ? "html" :
            file.endsWith(".css") ? "css" :
            file.endsWith(".json") ? "json" :
            file.endsWith(".md") ? "markdown" :
            "babel";

        const source = await fs.readFile(file, "utf8");

        const formatted = await prettier.format(source, {
            parser,
            printWidth: 100,
            tabWidth: 4,
            useTabs: false,
            singleQuote: true,
            trailingComma: "none"
        });

        await fs.writeFile(file, formatted);

        console.log("✓", file);
    }

})();