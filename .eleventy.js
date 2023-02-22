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
  md.use(require('markdown-it-anchor').default) // add anchors to headers
  md.use(require("markdown-it-table-of-contents"), {
    "includeLevel": [2,3,4]
  }) // toc support
  eleventyConfig.setLibrary("md", md);

  // plugins
  eleventyConfig.addPlugin(require('eleventy-plugin-lazyimages'));
  eleventyConfig.addPlugin(require("@11ty/eleventy-plugin-rss"));

  // copy files from static to site root
  eleventyConfig.addPassthroughCopy({ "static": "/" });

  // eleventy ignores
  eleventyConfig.ignores.add("**/_drafts/");
  if (process.env.ELEVENTY_ENV === "prd") {
    eleventyConfig.ignores.add("**/*-example-post-*.md");
  }
}
