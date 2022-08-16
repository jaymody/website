# My Website
My personal website/blog, built from scratch with [eleventy](https://www.11ty.dev).

### Installation
```bash
npm install
```

### Usage
```bash
npx @11ty/eleventy --serve --input src --output output
```
The website is published to `localhost:8080`.

By default, the example posts under `posts/` are included in the output. These posts are useful as a reference when making changes to the website (includes example markdown, gifs, images, image captions, mathjax, block code, inline code, etc ...). To ignore these posts, set `ELEVENTY_ENV=prd` before starting the website:
```bash
ELEVENTY_ENV=prd npx @11ty/eleventy --serve --input src --output output
```

### Structure
- `src`: Input directory for eleventy.
- `static`: Anything in this directory is copied to the site root.
- `.eleventy.js`: Eleventy configuration.
