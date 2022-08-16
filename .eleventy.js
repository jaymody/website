module.exports = function (eleventyConfig) {
  // custom markdown parser
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
  eleventyConfig.setLibrary("md", md);

  // plugins
  eleventyConfig.addPlugin(require('eleventy-plugin-lazyimages'));

  // copy files from static to site root
  eleventyConfig.addPassthroughCopy({ "static": "/" });

  // eleventy ignores
  eleventyConfig.ignores.add("**/_drafts/");
  if (process.env.ELEVENTY_ENV === "prd") {
    eleventyConfig.ignores.add("**/*-example-post-*.md");
  }
}
