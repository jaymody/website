module.exports = function (config) {
  let md = require("markdown-it")({
    html: true, // allows use of html in markdown ()
    breaks: true // converts \n to <br>
  });
  md.use(require('markdown-it-implicit-figures'), { // makes images figures
    figcaption: true // add figcaption using the alt text
  });
  md.use(require('markdown-it-footnote')); // use [^#] to create footnotes
  md.use(require('markdown-it-mathjax')()); // render latex ($$...$$) with mathjax
  md.use(require('markdown-it-multimd-table')) // add support for tables
  config.setLibrary("md", md);
}
