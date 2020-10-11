![droidpinkman.io](screenshot.png)

## Project Overview

 - Site Generator : 11ty
 - Template Language : Nunjucks
 - Styles : [Sass](https://www.belter.io/eleventy-sass-workflow)
 - Package Manager : NPM
 - Foundation : Node v12.x
 - Deployment : GH Pages and [GitHub Workflows](https://www.rockyourcode.com/how-to-deploy-eleventy-to-github-pages-with-github-actions)

## Installation

```shell
npm install
```

## CLI Commands

```shell
npm start
```

```shell
npm test
```

```shell
npm build
```

```shell
npm debug
```

## Environment Control

Environmental controls are governed by an option found within ``siteConfig.js``. [Docs reference](https://www.11ty.dev/docs/data-js/#example-exposing-environment-variables)

```shell
ELEVENTY_ENV=development
```

```shell
ELEVENTY_ENV=production
```

```nunjucks
{% if envConfig.environment == "[production|development]" %}
{% endif %}
```
