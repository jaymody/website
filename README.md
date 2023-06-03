# My Website
My personal website/blog, built from scratch with [eleventy](https://www.11ty.dev).

### Installation
```bash
npm install
```

### Usage
```bash
npm run serve
```

By default, the example posts under `posts/` are included in the output. These posts are useful as a reference when making changes to the website (includes example markdown, gifs, images, image captions, mathjax, block code, inline code, etc ...). To ignore these posts:

```bash
npm run serve-prod
```

### Structure
- `src`: Input directory for eleventy.
- `static`: Anything in this directory is copied to the site root.
- `.eleventy.js`: Eleventy configuration.
