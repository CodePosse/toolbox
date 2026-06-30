const fs = require('fs/promises');
const fg = require('fast-glob');
const cheerio = require('cheerio');
const prettier = require('prettier');
const config = require('../toolkit.config.js');

function ensureHead($) {
    if (!$('html').length) $.root().append('<html></html>');
    if (!$('head').length) $('html').prepend('<head></head>');
    if (!$('body').length) $('html').append('<body></body>');
}

function ensureId($, element, prefix, index) {
    const $el = $(element);
    let id = $el.attr('id');
    if (!id) {
        id = `${prefix}-${index + 1}`;
        $el.attr('id', id);
    }
    return id;
}

function hasAccessibleName($, element) {
    const $el = $(element);
    return Boolean($el.attr('aria-label') || $el.attr('aria-labelledby') || $el.text().trim());
}

async function processFile(file) {
    const source = await fs.readFile(file, 'utf8');
    const $ = cheerio.load(source, { decodeEntities: false });
    ensureHead($);

    if (!$('html').attr('lang')) $('html').attr('lang', config.language || 'en-US');

    $('img').each((index, img) => {
        const $img = $(img);
        if ($img.attr('alt') === undefined) $img.attr('alt', '');
        $img.removeAttr('title');
    });

    $('iframe').each((index, iframe) => {
        const $iframe = $(iframe);
        if (!$iframe.attr('title')) $iframe.attr('title', `Embedded content ${index + 1}`);
    });

    $('input, select, textarea').each((index, field) => {
        const $field = $(field);
        const type = String($field.attr('type') || '').toLowerCase();
        if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) return;

        const id = ensureId($, field, 'form-field', index);
        const hasLabel = $(`label[for="${id}"]`).length > 0;
        const hasAria = $field.attr('aria-label') || $field.attr('aria-labelledby');

        if (!hasLabel && !hasAria) {
            const text = $field.attr('placeholder') || $field.attr('name') || id || `Form field ${index + 1}`;
            $field.before(`\n<label for="${id}" class="visually-hidden">${text}</label>`);
        }
    });

    $('button').each((index, button) => {
        const $button = $(button);
        if (!hasAccessibleName($, button)) $button.attr('aria-label', `Button ${index + 1}`);
    });

    $('a').each((index, link) => {
        const $link = $(link);
        if (!hasAccessibleName($, link)) {
            const href = $link.attr('href') || '';
            $link.attr('aria-label', href || `Link ${index + 1}`);
        }
    });

    $('a[href$=".pdf"], a[href*=".pdf?"]').each((index, link) => {
        const $link = $(link);
        if (!$link.attr('aria-label')) {
            const text = $link.text().trim() || 'PDF file';
            $link.attr('aria-label', `${text} PDF file`);
        }
    });

    $('a[href$=".doc"], a[href$=".docx"], a[href*=".doc?"], a[href*=".docx?"]').each((index, link) => {
        const $link = $(link);
        if (!$link.attr('aria-label')) {
            const text = $link.text().trim() || 'Word document';
            $link.attr('aria-label', `${text} Word document`);
        }
    });

    $('[style*="display"], [style*="visibility"]').each((index, el) => {
        const $el = $(el);
        const style = String($el.attr('style') || '').toLowerCase();
        const hidden = style.includes('display:none') || style.includes('display: none') || style.includes('visibility:hidden') || style.includes('visibility: hidden');
        const hasAria = Object.keys(el.attribs || {}).some(attr => attr.toLowerCase().startsWith('aria-'));
        if (hidden && !hasAria) $el.attr('aria-hidden', 'true');
    });

    $('[id^="goog-gt-"]').each((index, el) => {
        const $el = $(el);
        $el.attr('aria-hidden', 'true');
        $el.attr('tabindex', '-1');
        if (!$el.attr('aria-label')) $el.attr('aria-label', $el.attr('id'));
    });

    const formatted = await prettier.format($.html(), { parser: 'html', tabWidth: 4, printWidth: 100 });
    await fs.writeFile(file, formatted, 'utf8');
    console.log(`ADA checked: ${file}`);
}

async function run() {
    const files = await fg(`${config.root}/**/*.html`, { dot: true });
    for (const file of files) await processFile(file);
    console.log(`ADA complete: ${files.length} file(s)`);
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
