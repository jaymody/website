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

By default, the example posts under `posts/` are ignored. If you want to render the example posts, set `ELEVENTY_ENV=dev` before starting the website:
```bash
ELEVENTY_ENV=dev npx @11ty/eleventy --serve --input src --output output
```

### Structure
- `src`: Input directory for eleventy.
- `static`: Anything in this directory is copied to the site root.
- `.eleventy.js`: Eleventy configuration.
